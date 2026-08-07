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

export const parseKisTradeMessage = (rawMessage: string): RealtimeTrade | null => {
  void rawMessage;
  return null;
};

