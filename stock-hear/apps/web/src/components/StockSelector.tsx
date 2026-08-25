interface StockSelectorProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

const starterStocks = [
  { symbol: "005930", name: "삼성전자" },
  { symbol: "000660", name: "SK하이닉스" },
  { symbol: "035420", name: "NAVER" },
  { symbol: "122630", name: "KODEX 레버리지" },
  { symbol: "041190", name: "우리기술투자" },
  { symbol: "MOCK_SURGE", name: "급등주 (Mock)" },
];

export const StockSelector = ({ symbol, onSymbolChange }: StockSelectorProps) => (
  <section className="panel" aria-labelledby="stock-selector-title">
    <h2 id="stock-selector-title">종목 선택</h2>
    <label htmlFor="stock-symbol">실시간으로 들을 종목</label>
    <select id="stock-symbol" value={symbol} onChange={(event) => onSymbolChange(event.target.value)}>
      {starterStocks.map((stock) => (
        <option key={stock.symbol} value={stock.symbol}>
          {stock.name} {stock.symbol}
        </option>
      ))}
    </select>
  </section>
);

