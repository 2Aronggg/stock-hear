import type { ConnectionStatus, RealtimeTrade } from "../types";

interface MarketDisplayProps {
  status: ConnectionStatus;
  trade: RealtimeTrade | null;
}

const statusLabel: Record<ConnectionStatus, string> = {
  connecting: "서버 연결 중",
  connected: "서버 연결됨",
  disconnected: "서버 연결 끊김",
  error: "서버 연결 오류"
};

export const MarketDisplay = ({ status, trade }: MarketDisplayProps) => (
  <section className="panel market-display" aria-labelledby="market-display-title">
    <h2 id="market-display-title">실시간 체결 정보</h2>
    <p className="status-badge">
      <span className={`status-dot ${status === "connected" ? "connected" : ""}`} aria-hidden="true" />
      {statusLabel[status]}
    </p>

    {trade ? (
      <dl className="market-values">
        <div>
          <dt>현재가</dt>
          <dd>{trade.currentPrice.toLocaleString("ko-KR")}원</dd>
        </div>
        <div>
          <dt>등락률</dt>
          <dd>{trade.changeRate.toFixed(2)}%</dd>
        </div>
        <div>
          <dt>체결량</dt>
          <dd>{trade.tradeVolume.toLocaleString("ko-KR")}</dd>
        </div>
        <div>
          <dt>누적거래량</dt>
          <dd>{trade.accumulatedVolume.toLocaleString("ko-KR")}</dd>
        </div>
        <div>
          <dt>마지막 체결시간</dt>
          <dd>{trade.tradeTime}</dd>
        </div>
      </dl>
    ) : (
      <p>아직 수신한 체결 정보가 없습니다.</p>
    )}
  </section>
);

