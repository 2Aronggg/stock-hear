export interface RealtimeTrade {
  symbol: string;
  tradeTime: string;
  currentPrice: number;
  changePrice: number;
  changeRate: number;
  tradeVolume: number;
  accumulatedVolume: number;

  // 프론트 샘플/추후 UI 확장용
  stockName?: string;
  receivedAt?: string;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export type ClientSocketMessage =
  | { type: "subscribe"; symbol: string }
  | { type: "unsubscribe"; symbol: string }
  | { type: "ping" };

export type ServerSocketMessage =
  | { type: "connected"; receivedAt: string }
  | { type: "subscribed"; symbol: string; receivedAt: string }
  | { type: "unsubscribed"; symbol: string; receivedAt: string }
  | { type: "trade"; trade: RealtimeTrade }
  | { type: "error"; message: string; receivedAt: string }
  | { type: "pong"; receivedAt: string };

