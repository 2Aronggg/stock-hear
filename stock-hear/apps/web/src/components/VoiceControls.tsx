import type { RealtimeTrade } from "../types";
import { listenOnce, parseVoiceCommand, speak } from "../audio/speech";

interface VoiceControlsProps {
  trade: RealtimeTrade | null;
  onSoundEnabledChange: (enabled: boolean) => void;
}

export const VoiceControls = ({ trade, onSoundEnabledChange }: VoiceControlsProps) => {
  const handleCommand = (transcript: string): void => {
    const command = parseVoiceCommand(transcript);

    if (command === "read-price") {
      speak(trade ? `현재가는 ${trade.currentPrice.toLocaleString("ko-KR")}원입니다.` : "아직 현재가가 없습니다.");
      return;
    }

    if (command === "read-change-rate") {
      speak(trade ? `등락률은 ${trade.changeRate.toFixed(2)}퍼센트입니다.` : "아직 등락률이 없습니다.");
      return;
    }

    if (command === "read-volume") {
      speak(trade ? `거래량은 ${trade.tradeVolume.toLocaleString("ko-KR")}주입니다.` : "아직 거래량이 없습니다.");
      return;
    }

    if (command === "start-sound") {
      onSoundEnabledChange(true);
      speak("소리를 시작합니다.");
      return;
    }

    if (command === "stop-sound") {
      onSoundEnabledChange(false);
      speak("소리를 멈춥니다.");
      return;
    }

    speak("지원하지 않는 명령입니다.");
  };

  const startListening = (): void => {
    const supported = listenOnce(handleCommand, () => undefined);

    if (!supported) {
      speak("이 브라우저는 음성 인식을 지원하지 않습니다.");
    }
  };

  return (
    <section className="panel" aria-labelledby="voice-controls-title">
      <h2 id="voice-controls-title">음성 명령</h2>
      <button type="button" onClick={startListening}>
        누르고 말하기
      </button>
      <p>현재가, 등락률, 거래량, 소리 시작, 소리 멈춰 명령을 지원합니다.</p>
    </section>
  );
};

