interface AudioControlsProps {
  enabled: boolean;
  muted: boolean;
  volume: number;
  onEnabledChange: (enabled: boolean) => void;
  onMutedChange: (muted: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onSample: (direction: "up" | "down" | "flat") => void;
}

export const AudioControls = ({
  enabled,
  muted,
  volume,
  onEnabledChange,
  onMutedChange,
  onVolumeChange,
  onSample
}: AudioControlsProps) => (
  <section className="panel" aria-labelledby="audio-controls-title">
    <h2 id="audio-controls-title">소리화 제어</h2>
    <div className="button-row">
      <button type="button" aria-pressed={enabled} onClick={() => onEnabledChange(!enabled)}>
        {enabled ? "소리 중지" : "소리 시작"}
      </button>
      <button type="button" aria-pressed={muted} onClick={() => onMutedChange(!muted)}>
        {muted ? "음소거 해제" : "음소거"}
      </button>
    </div>
    <label htmlFor="volume">볼륨</label>
    <input
      id="volume"
      type="range"
      min="0"
      max="0.4"
      step="0.01"
      value={volume}
      onChange={(event) => onVolumeChange(Number(event.target.value))}
    />
    <div className="button-row" aria-label="소리 샘플">
      <button type="button" onClick={() => onSample("up")}>
        상승음
      </button>
      <button type="button" onClick={() => onSample("down")}>
        하락음
      </button>
      <button type="button" onClick={() => onSample("flat")}>
        보합음
      </button>
    </div>
  </section>
);

