import type { RealtimeTrade } from "../types";

type Direction = "up" | "down" | "flat";
type EventState = "normal" | "surge" | "drop";

export class Sonification {
  private audioContext: AudioContext | null = null;
  private muted = false;
  private volume = 0.15;

  // 종목별 이전 가격
  private previousPrices = new Map<string, number>();

  // 종목별 급등락 상태
  private eventStates = new Map<string, EventState>();

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  setVolume(volume: number): void {
    this.volume = Math.min(0.4, Math.max(0, volume));
  }

  playTrade(trade: RealtimeTrade): void {
    if (
      this.muted ||
      !Number.isFinite(trade.currentPrice)
    ) {
      return;
    }

    const context = this.getAudioContext();

    if (context.state === "suspended") {
      void context.resume();
    }

    const symbol = trade.symbol;

    /*
     * =========================
     * 1. 종목별 이전 가격 가져오기
     * =========================
     */
    const previousPrice =
      this.previousPrices.get(symbol) ?? null;

    /*
     * =========================
     * 2. 종목별 급등락 상태 확인
     * =========================
     */
    const nextEventState =
      this.getEventState(trade.changeRate);

    const previousEventState =
      this.eventStates.get(symbol) ?? "normal";

    /*
     * 해당 종목이
     *
     * normal → surge
     * normal → drop
     *
     * 으로 진입할 때만 이벤트음 발생
     */
    if (
      nextEventState !== "normal" &&
      nextEventState !== previousEventState
    ) {
      this.playEventSound(
        context,
        nextEventState
      );
    }

    // 종목별 상태 저장
    this.eventStates.set(
      symbol,
      nextEventState
    );

    /*
     * =========================
     * 3. 일반 체결음
     * =========================
     */
    const direction = this.getDirection(
      trade.currentPrice,
      previousPrice
    );

    const frequency = this.getFrequency(
      trade.currentPrice,
      previousPrice,
      direction,
      trade.changeRate
    );

    const volumeLevel =
      this.getTradeVolume(
        trade.tradeVolume
      );

    const pulseCount =
      this.getPulseCount(
        trade.tradeVolume
      );

    /*
     * 현재 가격을 해당 종목의
     * 이전 가격으로 저장
     */
    this.previousPrices.set(
      symbol,
      trade.currentPrice
    );

    const now = context.currentTime;
    const pulseGap = 0.055;

    /*
     * 거래량이 클수록 pulse 증가
     */
    for (
      let i = 0;
      i < pulseCount;
      i += 1
    ) {
      this.playPulse(
        context,
        now + i * pulseGap,
        frequency,
        volumeLevel
      );
    }
  }

  /*
   * =========================
   * 급등락 상태
   * =========================
   */
  private getEventState(
    changeRate: number
  ): EventState {
    if (changeRate >= 2) {
      return "surge";
    }

    if (changeRate <= -2) {
      return "drop";
    }

    return "normal";
  }

  /*
   * =========================
   * 상승 / 하락 / 보합
   * =========================
   */
  private getDirection(
    currentPrice: number,
    previousPrice: number | null
  ): Direction {
    if (previousPrice === null) {
      return "flat";
    }

    if (currentPrice > previousPrice) {
      return "up";
    }

    if (currentPrice < previousPrice) {
      return "down";
    }

    return "flat";
  }

  /*
   * =========================
   * 일반 체결음 음높이
   * =========================
   */
  private getFrequency(
    currentPrice: number,
    previousPrice: number | null,
    direction: Direction,
    changeRate: number
  ): number {
    const baseFrequency = 440;
    const tickSize = 250;

    if (
      direction === "flat" ||
      previousPrice === null
    ) {
      const baseline = Math.max(
        -2,
        Math.min(2, changeRate)
      );

      return (
        baseFrequency *
        Math.pow(2, baseline / 24)
      );
    }

    const priceDelta = Math.abs(
      currentPrice - previousPrice
    );

    const tickCount = Math.max(
      1,
      Math.min(
        4,
        Math.round(
          priceDelta / tickSize
        )
      )
    );

    const semitones = tickCount * 3;

    if (direction === "up") {
      return (
        baseFrequency *
        Math.pow(
          2,
          semitones / 12
        )
      );
    }

    return (
      baseFrequency *
      Math.pow(
        2,
        -semitones / 12
      )
    );
  }

  /*
   * =========================
   * 급등 이벤트음
   * =========================
   */
  private playEventSound(
    context: AudioContext,
    state: EventState
  ): void {
    const now = context.currentTime;

    if (state === "surge") {
      this.playEventPulse(
        context,
        now,
        660,
        this.volume * 1.2
      );

      this.playEventPulse(
        context,
        now + 0.12,
        880,
        this.volume * 1.3
      );

      this.playEventPulse(
        context,
        now + 0.24,
        1100,
        this.volume * 1.4
      );

      return;
    }

    if (state === "drop") {
      this.playEventPulse(
        context,
        now,
        440,
        this.volume * 1.2
      );

      this.playEventPulse(
        context,
        now + 0.12,
        330,
        this.volume * 1.3
      );

      this.playEventPulse(
        context,
        now + 0.24,
        220,
        this.volume * 1.4
      );
    }
  }

  /*
   * =========================
   * 이벤트음
   * =========================
   */
  private playEventPulse(
    context: AudioContext,
    startTime: number,
    frequency: number,
    volume: number
  ): void {
    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.type = "triangle";

    oscillator.frequency.setValueAtTime(
      frequency,
      startTime
    );

    gain.gain.setValueAtTime(
      0.001,
      startTime
    );

    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, volume),
      startTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + 0.28
    );

    oscillator.connect(gain);
    gain.connect(
      context.destination
    );

    oscillator.start(startTime);
    oscillator.stop(
      startTime + 0.3
    );
  }

  /*
   * =========================
   * 거래량 → 볼륨
   * =========================
   */
  private getTradeVolume(
  tradeVolume: number
): number {
  const safeVolume = Math.max(
    1,
    tradeVolume
  );

  const logVolume =
    Math.log10(safeVolume);

  const normalized =
    Math.max(
      0,
      Math.min(
        1,
        logVolume / 4
      )
    );

  // 거래량에 따른 음량 차이를 더 크게
  const multiplier =
    0.2 +
    Math.pow(normalized, 0.6) * 0.8;

  return Math.min(
    0.4,
    Math.max(
      0.001,
      this.volume * multiplier
    )
  );
}

  /*
   * =========================
   * 거래량 → pulse 횟수
   * =========================
   */
  private getPulseCount(
    tradeVolume: number
  ): number {
    const safeVolume =
      Math.max(1, tradeVolume);

    if (safeVolume >= 2000) {
      return 4;
    }

    if (safeVolume >= 500) {
      return 3;
    }

    if (safeVolume >= 100) {
      return 2;
    }

    return 1;
  }

  /*
   * =========================
   * 일반 체결음
   * =========================
   */
  private playPulse(
    context: AudioContext,
    startTime: number,
    frequency: number,
    volume: number
  ): void {
    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      frequency,
      startTime
    );

    gain.gain.setValueAtTime(
      0.001,
      startTime
    );

    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, volume),
      startTime + 0.012
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + 0.11
    );

    oscillator.connect(gain);
    gain.connect(
      context.destination
    );

    oscillator.start(startTime);
    oscillator.stop(
      startTime + 0.12
    );
  }

  /*
   * =========================
   * 테스트용 샘플
   * =========================
   */
  playSample(
    direction: Direction,
    volume: "low" | "high" = "low"
  ): void {
    if (this.muted) {
      return;
    }

    const context =
      this.getAudioContext();

    if (context.state === "suspended") {
      void context.resume();
    }

    const frequency =
      direction === "up"
        ? 660
        : direction === "down"
          ? 330
          : 440;

    const volumeLevel =
      volume === "high"
        ? this.volume
        : this.volume * 0.45;

    this.playPulse(
      context,
      context.currentTime,
      frequency,
      volumeLevel
    );
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext =
        new AudioContext();
    }

    return this.audioContext;
  }
}