import type { RealtimeTrade } from "./parser.js";

export type TradeHandler = (trade: RealtimeTrade) => void;

export class KisRealtimeSocket {
  private readonly subscriptions = new Set<string>();
  private tradeHandler: TradeHandler | null = null;

  onTrade(handler: TradeHandler): void {
    this.tradeHandler = handler;
  }

  async connect(): Promise<void> {
    throw new Error("KIS realtime WebSocket connection is not implemented yet.");
  }

  subscribe(symbol: string): void {
    this.subscriptions.add(symbol);
  }

  unsubscribe(symbol: string): void {
    this.subscriptions.delete(symbol);
  }

  getSubscriptions(): string[] {
    return [...this.subscriptions];
  }

  protected emitTrade(trade: RealtimeTrade): void {
    this.tradeHandler?.(trade);
  }
}

