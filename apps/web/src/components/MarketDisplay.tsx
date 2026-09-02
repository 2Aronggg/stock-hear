import type { ConnectionStatus, RealtimeTrade } from "../types";

interface MarketDisplayProps {
  status: ConnectionStatus;
  trade: RealtimeTrade | null;
}

const statusLabel: Record<ConnectionStatus, string> = {
  connecting: "서버 연결 중",
  connected: "실시간 연결됨",
  disconnected: "서버 연결 안 됨",
  error: "서버 연결 오류"
};

const statusDescription: Record<ConnectionStatus, string> = {
  connecting: "실시간 체결 서버에 연결하고 있습니다.",
  connected: "선택한 종목의 체결 데이터를 수신하고 있습니다.",
  disconnected: "백엔드 서버를 실행하면 실시간 데이터가 표시됩니다.",
  error: "연결에 실패했습니다. 서버 상태와 웹소켓 주소를 확인해 주세요."
};

const formatSignedRate = (rate: number): string =>
  `${rate > 0 ? "+" : ""}${rate.toFixed(2)}%`;

const formatPrice = (price: number, currency: "KRW" | "USD"): string =>
  new Intl.NumberFormat(currency === "KRW" ? "ko-KR" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" ? 0 : 2
  }).format(price);

const formatSignedPrice = (
  price: number,
  currency: "KRW" | "USD"
): string => `${price > 0 ? "+" : ""}${formatPrice(price, currency)}`;

export const MarketDisplay = ({ status, trade }: MarketDisplayProps) => {
  const trendClass = trade
    ? trade.changeRate > 0
      ? "up"
      : trade.changeRate < 0
        ? "down"
        : "flat"
    : "flat";

  return (
    <section className={`market-feature ${trendClass}`} aria-labelledby="market-display-title">
      <div className="market-feature-copy">
        <span className="panel-kicker">LIVE DATA FROM 한국투자증권 API</span>
        <h2 id="market-display-title">실시간 체결 정보</h2>
        <div className="status-block">
          <p className={`status-badge ${status}`}>
            <span className="status-dot" aria-hidden="true" />
            {statusLabel[status]}
          </p>
          <p>{statusDescription[status]}</p>
        </div>
      </div>

      {trade ? (
        <div className="market-feature-data">
          <div className={`price-card ${trendClass}`} key={`${trade.symbol}-${trade.currentPrice}-${trade.tradeTime}`}>
            <span className="price-label">현재가</span>
            <strong>{formatPrice(trade.currentPrice, trade.currency)}</strong>
            <span>
              {formatSignedRate(trade.changeRate)} · {formatSignedPrice(trade.changePrice, trade.currency)}
            </span>
          </div>
          <dl className="market-values">
            <div>
              <dt>체결량</dt>
              <dd>{trade.tradeVolume.toLocaleString("ko-KR")}주</dd>
            </div>
            <div>
              <dt>누적 거래량</dt>
              <dd>{trade.accumulatedVolume.toLocaleString("ko-KR")}주</dd>
            </div>
            <div>
              <dt>마지막 체결 시간</dt>
              <dd>{trade.tradeTime}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="empty-state">
          <strong>수신 대기 중</strong>
          <span>종목을 선택하거나 음성으로 청취 세션을 시작하면 체결 정보가 여기에 표시됩니다.</span>
        </div>
      )}
    </section>
  );
};
