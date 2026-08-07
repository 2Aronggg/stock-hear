export interface RealtimeTrade {
  symbol: string;
  stockName: string;
  tradeTime: string;
  currentPrice: number;
  changePrice: number;
  changeRate: number;
  tradeVolume: number;
  accumulatedVolume: number;
  receivedAt: string;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export type ClientSocketMessage =
  | { type: "subscribe"; symbol: string }
  | { type: "unsubscribe"; symbol: string }
  | { type: "ping" };

export type ServerSocketMessage =
  | { type: "connected"; clientId: string; receivedAt: string }
  | { type: "subscribed"; symbol: string; receivedAt: string }
  | { type: "trade"; trade: RealtimeTrade }
  | { type: "error"; message: string; receivedAt: string }
  | { type: "pong"; receivedAt: string };

