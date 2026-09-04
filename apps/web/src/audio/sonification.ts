import type { ListeningPreferences, RealtimeTrade, SoundEventLog } from "../types";

export class Sonification {
  private audioContext: AudioContext | null = null;

  private muted = false;
  private volume = 0.15;
  private preferences: ListeningPreferences = {
    mode: "price-volume",
    speed: "normal",
    includeVolume: true,
    thresholdRate: null,
    speechDetailLevel: "medium"
  };

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  setVolume(volume: number): void {
    this.volume = Math.min(0.4, Math.max(0, volume));
  }

  setPreferences(preferences: ListeningPreferences): void {
    this.preferences = preferences;
  }

  playTrade(trade: RealtimeTrade, stockName = trade.stockName ?? trade.symbol): SoundEventLog | null {
    console.log(
      "[SONIFICATION]",
      "등락률:",
      trade.changeRate,
      "거래량:",
      trade.tradeVolume,
      "현재가:",
      trade.currentPrice
    );

    if (
      this.preferences.mode === "alerts-only" &&
      this.preferences.thresholdRate !== null &&
      Math.abs(trade.changeRate) < this.preferences.thresholdRate
    ) {
      return null;
    }

    const soundEvent = this.createSoundEvent(trade, stockName);

    if (this.muted) {
      return soundEvent;
    }

    const context = this.getAudioContext();

    if (context.state === "suspended") {
      void context.resume();
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    // 등락률 → 음높이
    const frequency = this.getFrequency(trade.changeRate);

    // 체결량 → 음량
    const volume = this.preferences.includeVolume
      ? this.getTradeVolume(trade.tradeVolume)
      : this.volume;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const now = context.currentTime;
    const duration = this.getDuration();

    // 갑작스러운 음량 변화로 인한 클릭 노이즈 방지
    gain.gain.setValueAtTime(0.001, now);

    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, volume),
      now + 0.01
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + duration
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);

    return soundEvent;
  }

  playSample(
    direction: "up" | "down" | "flat",
    volume: "low" | "high" = "low"
  ): void {
    const sampleTrade: RealtimeTrade = {
      market: "KR",
      exchange: "DEMO",
      symbol: "SAMPLE",
      stockName: "샘플",
      currency: "KRW",
      tradeTime: "000000",
      currentPrice: 10000,

      changePrice:
        direction === "up"
          ? 100
          : direction === "down"
            ? -100
            : 0,

      changeRate:
        direction === "up"
          ? 1.2
          : direction === "down"
            ? -1.2
            : 0,

      tradeVolume:
        volume === "high"
          ? 1_000_000
          : 1_000,

      accumulatedVolume: 1_000_000,
      receivedAt: new Date().toISOString()
    };

    this.playTrade(sampleTrade, "샘플");
  }

  /**
   * 등락률 → 주파수
   *
   * -10% → 190Hz
   *  -5% → 315Hz
   *   0% → 440Hz
   *  +5% → 565Hz
   * +10% → 690Hz
   *
   * 기존보다 범위를 넓혀서
   * 실제 대형주에서도 등락 방향을 구분하기 쉽도록 한다.
   */
  private getFrequency(changeRate: number): number {
    const clampedRate = Math.max(
      -10,
      Math.min(10, changeRate)
    );

    return 440 + clampedRate * 25;
  }

  private getDuration(): number {
    if (this.preferences.speed === "slow") {
      return 0.24;
    }

    if (this.preferences.speed === "fast") {
      return 0.08;
    }

    return 0.12;
  }

  /**
   * 체결량 → 음량
   *
   * 실제 KIS 데이터의 tradeVolume은
   * 1, 5, 75, 533, 19305처럼 범위가 매우 크다.
   *
   * 따라서 선형 스케일 대신 log10을 사용한다.
   */
  private getTradeVolume(tradeVolume: number): number {
    const safeVolume = Math.max(1, tradeVolume);

    const logVolume = Math.log10(safeVolume);

    const normalizedVolume = Math.min(
      1,
      logVolume / 5
    );

    const volumeBoost =
      normalizedVolume * 0.3;

    return Math.min(
      0.4,
      Math.max(
        0.03,
        this.volume * 0.4 + volumeBoost
      )
    );
  }

  private getAudioContext(): AudioContext {
    this.audioContext ??= new AudioContext();

    return this.audioContext;
  }

  private createSoundEvent(trade: RealtimeTrade, stockName: string): SoundEventLog {
    const soundEvent =
      trade.changeRate > 0
        ? "PRICE_UP"
        : trade.changeRate < 0
          ? "PRICE_DOWN"
          : "PRICE_FLAT";

    return {
      soundEvent,
      symbol: trade.symbol,
      stockName,
      createdAt: new Date().toISOString(),
      sourceData: {
        currentPrice: trade.currentPrice,
        changePrice: trade.changePrice,
        changeRate: trade.changeRate,
        tradeVolume: trade.tradeVolume
      },
      mapping: {
        pitch: "priceDirection",
        volume: this.preferences.includeVolume ? "tradeVolume" : "fixed",
        tempo: this.preferences.speed
      }
    };
  }
}
