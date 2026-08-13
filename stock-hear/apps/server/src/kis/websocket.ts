import WebSocket from "ws";
import { config } from "../config.js";
import type { RealtimeTrade } from "./parser.js";

export type TradeHandler = (trade: RealtimeTrade) => void;

const KIS_REALTIME_TRADE_TR_ID = "H0STCNT0";

export class KisRealtimeSocket {
  //현재 구독 요청한 종목들을 기억하는 저장소
  private readonly subscriptions = new Set<string>();
  //체결 데이터가 들어왔을 때 실행할 함수를 저장
  private tradeHandler: TradeHandler | null = null;
  //KIS와 실제로 연결된 WebSocket 객체를 저장
  private socket: WebSocket | null = null;

  onTrade(handler: TradeHandler): void {
    this.tradeHandler = handler;
  }

  //KIS와 연결
  async connect(): Promise<void> {
    const websocketUrl = config.KIS_WEBSOCKET_URL;

    //connect() 호출했는데 KIS_WEBSOCKET_URL이 없음
    if (!websocketUrl) {
    throw new Error("KIS WebSocket URL is not configured.");
    }

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(websocketUrl);

      this.socket = socket;

      socket.on("open", () => {
        console.info("[KIS WS] connected");
        resolve();
      });

      socket.on("message", (data) => {
        this.handleMessage(data.toString());
      });

      socket.on("error", () => {
        console.error("[KIS WS] connection error");
        //연결이 아직 열리지 않은 상태
        if (socket.readyState !== WebSocket.OPEN) {
          reject(new Error("Failed to connect to KIS WebSocket."));
        }
      });

      socket.on("close", () => {
        console.info("[KIS WS] disconnected");
        this.socket = null;
      });
    });
  }
  //연결된 KIS에 요청
  subscribe(symbol: string): void {
    const normalizedSymbol = symbol.trim();

    //trim() 후 빈 문자열인 경우
    if (!normalizedSymbol) {
      console.error("[KIS WS] invalid stock symbol");
      return;
    }

    //아직 연결 안 됐는데 subscribe 호출 한 경우
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("[KIS WS] socket is not connected");
      return;
    }

    //approval key가 없는데 구독 시도
    if (!config.KIS_APPROVAL_KEY) {
      console.error("[KIS WS] approval key is not configured");
      return;
    }

    //해당 JSON을 KIS로 전송
    const message = {
      header: {
        approval_key: config.KIS_APPROVAL_KEY,
        custtype: "P",
        tr_type: "1",
        "content-type": "utf-8"
      },
      body: {
        input: {
          tr_id: KIS_REALTIME_TRADE_TR_ID,
          tr_key: normalizedSymbol
        }
      }
    };

    this.socket.send(JSON.stringify(message));
    //구독 목록에 저장
    this.subscriptions.add(normalizedSymbol);

    console.info("[KIS WS] subscription requested", {
      trId: KIS_REALTIME_TRADE_TR_ID,
      symbol: normalizedSymbol
    });
  }

  unsubscribe(symbol: string): void {
    // TODO: 2차 개발에서 KIS 구독 해제 메시지 전송 구현 예정
    this.subscriptions.delete(symbol);
  }

  getSubscriptions(): string[] {
    return [...this.subscriptions];
  }
  //KIS가 보내오는 모든 메세지를 받아서 무슨 종류인지 판별
  private handleMessage(rawMessage: string): void {
    if (!rawMessage) {
      console.error("[KIS WS] empty message received");
      return;
    }

    try {
      if (rawMessage.startsWith("0|") || rawMessage.startsWith("1|")) {
        const parts = rawMessage.split("|");

        if (parts.length < 4) {
          console.error("[KIS WS] invalid realtime message");
          return;
        }

        console.info("[KIS WS] realtime message received", {
          trId: parts[1]
        });

        return;
      }

      const message: unknown = JSON.parse(rawMessage);

      if (!this.isRecord(message)) {
        console.error("[KIS WS] invalid system message");
        return;
      }

      const header = message.header;

      if (!this.isRecord(header)) {
        console.error("[KIS WS] invalid system header");
        return;
      }

      const trId = header.tr_id;

      if (trId === "PINGPONG") {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.pong(rawMessage);
        }

        console.info("[KIS WS] PINGPONG");
        return;
      }

      console.info("[KIS WS] system message received", {
        trId: typeof trId === "string" ? trId : "unknown"
      });
    } catch {
      console.error("[KIS WS] failed to process message");
    }
  }
  //JSON으로 받은 값이 실제 객체인지 TypeScript에서 안전하게 확인하는 보조 함수
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }
  //나중에 파싱 완료된 RealtimeTrade를 다음 단계로 전달
  protected emitTrade(trade: RealtimeTrade): void {
    this.tradeHandler?.(trade);
  }
}
