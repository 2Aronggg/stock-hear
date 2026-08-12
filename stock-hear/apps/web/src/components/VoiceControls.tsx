import { useState } from "react";
import type { RealtimeTrade } from "../types";
import { listenOnce, parseVoiceCommand, speak } from "../audio/speech";

interface VoiceControlsProps {
  trade: RealtimeTrade | null;
  onSoundEnabledChange: (enabled: boolean) => void;
}

const errorMessages: Record<string, string> = {
  "not-allowed": "마이크 권한이 없어 음성 명령을 사용할 수 없습니다.",
  "no-speech": "음성이 감지되지 않았습니다. 다시 시도해주세요.",
  "audio-capture": "마이크를 찾을 수 없습니다.",
  network: "네트워크 오류로 음성 인식에 실패했습니다."
};

export const VoiceControls = ({ trade, onSoundEnabledChange }: VoiceControlsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const announce = (text: string): void => {
    speak(text);
    setStatusMessage(text);
  };

  const handleCommand = (transcript: string): void => {
    const command = parseVoiceCommand(transcript);

    if (command === "read-price") {
      announce(trade ? `현재가는 ${trade.currentPrice.toLocaleString("ko-KR")}원입니다.` : "아직 현재가가 없습니다.");
      return;
    }

    if (command === "read-change-rate") {
      announce(trade ? `등락률은 ${trade.changeRate.toFixed(2)}퍼센트입니다.` : "아직 등락률이 없습니다.");
      return;
    }

    if (command === "read-volume") {
      announce(trade ? `거래량은 ${trade.tradeVolume.toLocaleString("ko-KR")}주입니다.` : "아직 거래량이 없습니다.");
      return;
    }

    if (command === "start-sound") {
      onSoundEnabledChange(true);
      announce("소리를 시작합니다.");
      return;
    }

    if (command === "stop-sound") {
      onSoundEnabledChange(false);
      announce("소리를 멈춥니다.");
      return;
    }

    announce("지원하지 않는 명령입니다.");
  };

  const startListening = (): void => {
    if (isListening) {
      return;
    }

    const supported = listenOnce(
      handleCommand,
      () => setIsListening(false),
      (error) => {
        setIsListening(false);
        setStatusMessage(errorMessages[error] ?? "음성 인식에 실패했습니다.");
      }
    );

    if (!supported) {
      announce("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    setIsListening(true);
    setStatusMessage("듣고 있습니다. 말씀해주세요.");
  };

  return (
    <section className="panel" aria-labelledby="voice-controls-title">
      <h2 id="voice-controls-title">음성 명령</h2>
      <button type="button" onClick={startListening} disabled={isListening} aria-pressed={isListening}>
        {isListening ? "듣는 중..." : "누르고 말하기"}
      </button>
      <p role="status" aria-live="polite">
        {statusMessage}
      </p>
      <p>현재가, 등락률, 거래량, 소리 시작, 소리 멈춰 명령을 지원합니다.</p>
    </section>
  );
};

