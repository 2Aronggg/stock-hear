import WebSocket from "ws";
import { config } from "../config.js";
import { requestKisApprovalKey } from "./auth.js";
import {
    parseKisTradeMessage,
    type RealtimeTrade
} from "./parser.js";


export type TradeHandler = (trade: RealtimeTrade) => void;

const KIS_REALTIME_TRADE_TR_ID = "H0STCNT0";

export class KisRealtimeSocket {
  // 현재 구독 요청한 종목들을 기억하는 저장소
  private readonly subscriptions = new Set<string>();

  // 체결 데이터가 들어왔을 때 실행할 함수를 저장
  private tradeHandler: TradeHandler | null = null;

  // KIS와 실제로 연결된 WebSocket 객체를 저장
  private socket: WebSocket | null = null;

  // A 파트의 인증 함수로 발급받은 approval key 저장
  private approvalKey: string | null = null;

  onTrade(handler: TradeHandler): void {
    this.tradeHandler = handler;
  }

  // KIS와 연결
  async connect(): Promise<void> {
    const websocketUrl = config.KIS_WEBSOCKET_URL;

    if (!websocketUrl) {
      throw new Error("KIS WebSocket URL is not configured.");
    }

    // A 파트의 인증 함수를 이용해 approval key 발급
    this.approvalKey = await requestKisApprovalKey();

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

  // 연결된 KIS에 실시간 체결가 구독 요청
  subscribe(symbol: string): void {
    const normalizedSymbol = symbol.trim();

    // trim() 후 빈 문자열인 경우
    if (!normalizedSymbol) {
      console.error("[KIS WS] invalid stock symbol");
      return;
    }

    // 아직 연결 안 됐는데 subscribe 호출한 경우
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("[KIS WS] socket is not connected");
      return;
    }

    // approval key가 없는데 구독 시도
    if (!this.approvalKey) {
      console.error("[KIS WS] approval key is not available");
      return;
    }

    // 해당 JSON을 KIS로 전송
    const message = {
      header: {
        approval_key: this.approvalKey,
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

    // 구독 목록에 저장
    this.subscriptions.add(normalizedSymbol);

    console.info("[KIS WS] subscription requested", {
      trId: KIS_REALTIME_TRADE_TR_ID,
      symbol: normalizedSymbol
    });
  }

  unsubscribe(symbol: string): void {
    // TODO: KIS 구독 해제 메시지 전송 구현 예정
    this.subscriptions.delete(symbol);
  }

  getSubscriptions(): string[] {
    return [...this.subscriptions];
  }

  // KIS가 보내오는 모든 메시지를 받아서 무슨 종류인지 판별
  private handleMessage(rawMessage: string): void {
    if (!rawMessage) {
      console.error("[KIS WS] empty message received");
      return;
    }

    try {
      // 실시간 데이터 메시지
      if (rawMessage.startsWith("0|") || rawMessage.startsWith("1|")) {
        const trade = parseKisTradeMessage(rawMessage);

        if (!trade) {
          console.error("[KIS WS] failed to parse realtime trade");
          return;
        }

        console.info("[KIS WS] realtime trade parsed", {
          symbol: trade.symbol,
          currentPrice: trade.currentPrice,
          changeRate: trade.changeRate,
          tradeVolume: trade.tradeVolume
        });

        this.emitTrade(trade);
        return;
      }

      // 그 외 JSON 형태의 시스템 메시지
      const message: unknown = JSON.parse(rawMessage);

      // JSON으로 변환한 값이 객체인지 확인
      if (!this.isRecord(message)) {
        console.error("[KIS WS] invalid system message");
        return;
      }

      const header = message.header;

      // header가 객체인지 확인
      if (!this.isRecord(header)) {
        console.error("[KIS WS] invalid system header");
        return;
      }

      const trId = header.tr_id;

      // KIS 서버의 연결 유지 메시지 처리
      if (trId === "PINGPONG") {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.pong(rawMessage);
        }

        console.info("[KIS WS] PINGPONG");
        return;
      }

      // 시스템 메시지의 상세 응답 확인
      const body = message.body;

      const msg1 =
        this.isRecord(body) && typeof body.msg1 === "string"
          ? body.msg1
          : "unknown";

      console.info("[KIS WS] system message received", {
        trId: typeof trId === "string" ? trId : "unknown",
        message: msg1
      });
    } catch {
      console.error("[KIS WS] failed to process message");
    }
  }

  // JSON으로 받은 값이 실제 객체인지 TypeScript에서 안전하게 확인하는 보조 함수
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  // 나중에 파싱 완료된 RealtimeTrade를 다음 단계로 전달
  protected emitTrade(trade: RealtimeTrade): void {
    this.tradeHandler?.(trade);
  }
}
