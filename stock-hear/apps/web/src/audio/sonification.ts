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

  // 종목별 거래량 강조음 마지막 재생 시각
  private lastRollTimes = new Map<string, number>();

  // 거래량 강조음이 너무 자주 반복되지 않도록 하는 간격
  private readonly rollCooldown = 450;

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
     * 급등락 이벤트음은
     *
     * normal → surge
     * normal → drop
     *
     * 으로 진입할 때만 발생
     *
     * 따라서 같은 급등 구간에서
     * 체결이 계속 들어와도 효과음이
     * 계속 반복되지 않음.
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

    /*
     * 거래량 자체를 음량으로 크게 차이나게
     * 만들기보다는 일정한 음량을 유지한다.
     *
     * 거래량의 차이는 아래의
     * roll sound로 표현한다.
     */
    const volumeLevel =
      this.getTradeVolume(
        trade.tradeVolume
      );

    /*
     * 이전 가격 저장
     */
    this.previousPrices.set(
      symbol,
      trade.currentPrice
    );

    const now = context.currentTime;

    /*
     * 일반 체결음은 모든 체결에서
     * 한 번만 재생한다.
     */
    this.playPulse(
      context,
      now,
      frequency,
      volumeLevel
    );

    /*
     * =========================
     * 4. 거래량 강조음
     * =========================
     *
     * 거래량이 일정 수준 이상이면
     * 짧은 "또르륵" 소리를 추가한다.
     *
     * 단, 실시간 체결 데이터가 매우 빠르게
     * 들어오는 경우 소리가 겹치지 않도록
     * 종목별 cooldown을 적용한다.
     */
    if (
      this.shouldPlayRollSound(
        symbol,
        trade.tradeVolume,
        now
      )
    ) {
      const rollCount =
        this.getRollCount(
          trade.tradeVolume
        );

      this.playRollSound(
        context,
        now,
        direction,
        rollCount
      );

      this.lastRollTimes.set(
        symbol,
        now * 1000
      );
    }
  }

  /*
   * =========================
   * 급등락 상태
   * =========================
   *
   * 강조 효과음이 너무 자주 나오는 것을
   * 막기 위해 ±3%부터 이벤트로 처리한다.
   */
  private getEventState(
    changeRate: number
  ): EventState {
    if (changeRate >= 3) {
      return "surge";
    }

    if (changeRate <= -3) {
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
   * 급등락 이벤트음
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
   * 거래량 → 일반 체결음 볼륨
   * =========================
   *
   * 거래량 차이를 볼륨으로 크게 표현하지 않는다.
   *
   * 거래량의 핵심 정보는
   * 아래 roll sound가 담당한다.
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

    /*
     * 거래량에 따른 볼륨 차이를
     * 이전보다 작게 만든다.
     */
    const multiplier =
      0.65 +
      normalized * 0.25;

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
   * 거래량 → 또르륵 발생 여부
   * =========================
   *
   * 기존 최소 기준: 100
   * 변경 최소 기준: 30
   */
  private shouldPlayRollSound(
    symbol: string,
    tradeVolume: number,
    currentTime: number
  ): boolean {
    if (tradeVolume < 30) {
      return false;
    }

    const lastTime =
      this.lastRollTimes.get(symbol);

    if (lastTime === undefined) {
      return true;
    }

    const elapsed =
      currentTime * 1000 - lastTime;

    return elapsed >= this.rollCooldown;
  }

  /*
   * =========================
   * 거래량 → 또르륵 음 개수
   * =========================
   *
   * 30   ~ 99   → 2음
   * 100  ~ 299  → 3음
   * 300  ~ 999  → 4음
   * 1000 이상   → 5음
   */
  private getRollCount(
    tradeVolume: number
  ): number {
    const safeVolume =
      Math.max(1, tradeVolume);

    if (safeVolume >= 1000) {
      return 5;
    }

    if (safeVolume >= 300) {
      return 4;
    }

    if (safeVolume >= 100) {
      return 3;
    }

    if (safeVolume >= 30) {
      return 2;
    }

    return 0;
  }

  /*
   * =========================
   * 거래량 또르륵 효과음
   * =========================
   *
   * 거래량이 클수록
   * 짧은 음을 더 많이 연속해서 재생한다.
   *
   * 상승 → 점점 높은 음
   * 하락 → 점점 낮은 음
   * 보합 → 같은 방향의 짧은 패턴
   */
  private playRollSound(
    context: AudioContext,
    startTime: number,
    direction: Direction,
    count: number
  ): void {
    const gap = 0.055;

    const baseFrequency =
      direction === "up"
        ? 620
        : direction === "down"
          ? 420
          : 520;

    for (let i = 0; i < count; i += 1) {
      let frequency = baseFrequency;

      if (direction === "up") {
        frequency =
          baseFrequency *
          Math.pow(
            2,
            (i * 2) / 12
          );
      } else if (direction === "down") {
        frequency =
          baseFrequency *
          Math.pow(
            2,
            -(i * 2) / 12
          );
      } else {
        /*
         * 보합에서는 살짝 위아래로 움직여
         * 단순 반복음과 구분한다.
         */
        const offset =
          i % 2 === 0 ? 0 : 1;

        frequency =
          baseFrequency *
          Math.pow(
            2,
            offset / 12
          );
      }

      this.playRollPulse(
        context,
        startTime + i * gap,
        frequency,
        this.volume * 0.65
      );
    }
  }

  /*
   * =========================
   * 또르륵 개별 음
   * =========================
   */
  private playRollPulse(
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
      startTime + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + 0.045
    );

    oscillator.connect(gain);
    gain.connect(
      context.destination
    );

    oscillator.start(startTime);
    oscillator.stop(
      startTime + 0.05
    );
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