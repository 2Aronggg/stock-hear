import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { WebSocket, WebSocketServer } from "ws";

import { config } from "./config.js";
import { KisRealtimeSocket } from "./kis/websocket.js";
import type { RealtimeTrade } from "./kis/parser.js";

type ServerMessage =
  | { type: "connected"; receivedAt: string }
  | { type: "trade"; trade: RealtimeTrade }
  | { type: "error"; message: string; receivedAt: string };

const TEST_SYMBOL = "005930";

const app = express();
const httpServer = createServer(app);

const socketServer = new WebSocketServer({
  server: httpServer,
  path: "/ws"
});

const kisSocket = new KisRealtimeSocket();

app.use(cors({ origin: config.CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "stock-hear-server",
    kisEnvironment: config.KIS_ENVIRONMENT,
    receivedAt: new Date().toISOString()
  });
});

// 프론트 WebSocket 연결
socketServer.on("connection", (socket) => {
  console.info("[SERVER WS] frontend connected");

  sendJson(socket, {
    type: "connected",
    receivedAt: new Date().toISOString()
  });

  socket.on("close", () => {
    console.info("[SERVER WS] frontend disconnected");
  });
});

// websocket.ts에서 parser를 거쳐 생성된 RealtimeTrade를 받음
kisSocket.onTrade((trade) => {
  broadcast({
    type: "trade",
    trade
  });
});

// 특정 프론트 클라이언트에게 JSON 전송
const sendJson = (
  socket: WebSocket,
  message: ServerMessage
): void => {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify(message));
};

// 현재 연결된 모든 프론트 클라이언트에게 전송
const broadcast = (message: ServerMessage): void => {
  for (const client of socketServer.clients) {
    sendJson(client, message);
  }
};

const startServer = async (): Promise<void> => {
  try {
    // 내부적으로 requestKisApprovalKey() 호출 후 KIS WebSocket 연결
    await kisSocket.connect();

    // 2차 개발용 임시 고정 종목
    kisSocket.subscribe(TEST_SYMBOL);

    httpServer.listen(config.PORT, () => {
      console.info("stock-hear server started", {
        port: config.PORT,
        clientOrigin: config.CLIENT_ORIGIN,
        kisSymbol: TEST_SYMBOL
      });
    });
  } catch {
    console.error(
      "Failed to start stock-hear server because KIS connection failed."
    );

    process.exitCode = 1;
  }
};

void startServer();

