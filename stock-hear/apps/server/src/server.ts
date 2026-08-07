import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { config } from "./config.js";
import type { RealtimeTrade } from "./kis/parser.js";

type ClientMessage =
  | { type: "subscribe"; symbol: string }
  | { type: "unsubscribe"; symbol: string }
  | { type: "ping" };

type ServerMessage =
  | { type: "connected"; clientId: string; receivedAt: string }
  | { type: "subscribed"; symbol: string; receivedAt: string }
  | { type: "trade"; trade: RealtimeTrade }
  | { type: "error"; message: string; receivedAt: string }
  | { type: "pong"; receivedAt: string };

interface ClientConnection {
  id: string;
  socket: WebSocket;
  subscriptions: Set<string>;
}

const app = express();
const httpServer = createServer(app);
const clients = new Map<string, ClientConnection>();
let nextClientId = 1;

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

const socketServer = new WebSocketServer({ server: httpServer, path: "/ws" });

socketServer.on("connection", (socket) => {
  const clientId = `client-${nextClientId}`;
  nextClientId += 1;

  const client: ClientConnection = {
    id: clientId,
    socket,
    subscriptions: new Set<string>()
  };

  clients.set(clientId, client);
  sendJson(socket, { type: "connected", clientId, receivedAt: new Date().toISOString() });

  socket.on("message", (data) => {
    handleClientMessage(client, data.toString());
  });

  socket.on("close", () => {
    clients.delete(client.id);
  });
});

const handleClientMessage = (client: ClientConnection, rawMessage: string): void => {
  const message = parseClientMessage(rawMessage);

  if (!message) {
    sendJson(client.socket, {
      type: "error",
      message: "Invalid WebSocket message.",
      receivedAt: new Date().toISOString()
    });
    return;
  }

  if (message.type === "ping") {
    sendJson(client.socket, { type: "pong", receivedAt: new Date().toISOString() });
    return;
  }

  if (message.type === "subscribe") {
    client.subscriptions.add(message.symbol);
    sendJson(client.socket, {
      type: "subscribed",
      symbol: message.symbol,
      receivedAt: new Date().toISOString()
    });
    return;
  }

  client.subscriptions.delete(message.symbol);
};

const parseClientMessage = (rawMessage: string): ClientMessage | null => {
  try {
    const parsed: unknown = JSON.parse(rawMessage);

    if (!isRecord(parsed) || typeof parsed.type !== "string") {
      return null;
    }

    if (parsed.type === "ping") {
      return { type: "ping" };
    }

    if (
      (parsed.type === "subscribe" || parsed.type === "unsubscribe") &&
      typeof parsed.symbol === "string" &&
      parsed.symbol.trim().length > 0
    ) {
      return { type: parsed.type, symbol: parsed.symbol.trim() };
    }

    return null;
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const sendJson = (socket: WebSocket, message: ServerMessage): void => {
  socket.send(JSON.stringify(message));
};

httpServer.listen(config.PORT, () => {
  console.info("stock-hear server started", {
    port: config.PORT,
    clientOrigin: config.CLIENT_ORIGIN
  });
});

