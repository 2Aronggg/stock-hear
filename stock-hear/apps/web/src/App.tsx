import { useEffect, useMemo, useRef, useState } from "react";
import { MarketSocket } from "./api/marketSocket";
import { Sonification } from "./audio/sonification";
import { AudioControls } from "./components/AudioControls";
import { MarketDisplay } from "./components/MarketDisplay";
import { isSupportedSymbol, StockSelector } from "./components/StockSelector";
import { VoiceControls } from "./components/VoiceControls";
import type { ConnectionStatus, RealtimeTrade, ServerSocketMessage } from "./types";

const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL ?? "ws://localhost:4000/ws";

const selectedSymbolStorageKey = "stock-hear:selected-symbol";
const defaultSymbol = "005930";
const soundEnabledStorageKey = "stock-hear:sound-enabled";

const getInitialSymbol = (): string => {
  const savedSymbol = window.localStorage.getItem(selectedSymbolStorageKey);

  return savedSymbol && isSupportedSymbol(savedSymbol)
    ? savedSymbol
    : defaultSymbol;
};

const getInitialSoundEnabled = (): boolean =>
  window.localStorage.getItem(soundEnabledStorageKey) === "true";

export const App = () => {
  const [symbol, setSymbol] = useState(getInitialSymbol);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [latestTrade, setLatestTrade] = useState<RealtimeTrade | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(getInitialSoundEnabled);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const sonification = useMemo(() => new Sonification(), []);
  const socketRef = useRef<MarketSocket | null>(null);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    sonification.setMuted(muted || !soundEnabled);
    sonification.setVolume(volume);
  }, [muted, sonification, soundEnabled, volume]);

  useEffect(() => {
  soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const socket = new MarketSocket({
      url: websocketUrl,
      symbol,
      onStatusChange: setStatus,
      onMessage: (message: ServerSocketMessage) => {
        if (message.type === "trade") {
          setLatestTrade(message.trade);
          if (soundEnabledRef.current) {
            sonification.playTrade(message.trade);
          }
        }
      }
    });

    socketRef.current = socket;
    socket.connect();
    return () => socket.disconnect();
  }, [sonification]);
  
  const handleSymbolChange = (nextSymbol: string): void => {
    if (nextSymbol === symbol || !isSupportedSymbol(nextSymbol)) {
      return;
    }
    
    socketRef.current?.unsubscribe(symbol);
    socketRef.current?.subscribe(nextSymbol);
    
    window.localStorage.setItem(selectedSymbolStorageKey, nextSymbol);
    setLatestTrade(null);
    setSymbol(nextSymbol);
  };

  const handleSoundEnabledChange = (enabled: boolean): void => {
    window.localStorage.setItem(
      soundEnabledStorageKey,
      String(enabled)
    );

    soundEnabledRef.current = enabled;
    setSoundEnabled(enabled);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      <div id="live-region" className="sr-only" aria-live="polite" aria-atomic="true">
        {status === "connected" ? "서버에 연결되었습니다." : ""}
      </div>
      <main id="main-content" className="page">
        <div className="shell">
          <header className="hero">
            <h1>stock-hear</h1>
            <p>
              국내 주식 실시간 체결 정보를 소리와 음성 안내로 전달하기 위한 접근성 우선 MVP입니다.
            </p>
          </header>

          <div className="grid">
            <StockSelector symbol={symbol} onSymbolChange={handleSymbolChange} />
            <MarketDisplay status={status} trade={latestTrade} />
            <AudioControls
              enabled={soundEnabled}
              muted={muted}
              volume={volume}
              onEnabledChange={handleSoundEnabledChange}
              onMutedChange={setMuted}
              onVolumeChange={setVolume}
              onSample={(direction) => sonification.playSample(direction)}
              onVolumeSample={(volume) => sonification.playSample("flat", volume)}
            />
            <VoiceControls trade={latestTrade} onSoundEnabledChange={handleSoundEnabledChange} />
          </div>
        </div>
      </main>
    </>
  );
};

