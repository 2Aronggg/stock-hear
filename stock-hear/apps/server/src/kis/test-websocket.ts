import { KisRealtimeSocket } from "./websocket.js";

const socket = new KisRealtimeSocket();

const run = async (): Promise<void> => {
  try {
    await socket.connect();

    console.info("[TEST] KIS WebSocket connection successful");
    //삼성전자 종목코드 (단순 테스트용)
    socket.subscribe("005930");
  } catch {
    console.error("[TEST] KIS WebSocket test failed");
    process.exitCode = 1;
  }
};

void run();