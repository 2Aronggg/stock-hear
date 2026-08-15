import type { RealtimeTrade } from "../types";

export class Sonification {
  private audioContext: AudioContext | null = null;
  private muted = false;
  private volume = 0.15;

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  setVolume(volume: number): void {
    this.volume = Math.min(0.4, Math.max(0, volume));
  }

  playTrade(trade: RealtimeTrade): void {
    if (this.muted) {
      return;
    }

    const context = this.getAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    const frequency = this.getFrequency(trade.changeRate);
    const volume = this.getTradeVolume(trade.tradeVolume);

    oscillator.frequency.value = frequency;
    gain.gain.value = volume;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);
  }

  playSample(
    direction: "up" | "down" | "flat",
    volume: "low" | "high" = "low"
  ): void {
    const sampleTrade: RealtimeTrade = {
      symbol: "SAMPLE",
      stockName: "샘플",
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
      tradeVolume: volume === "high" ? 1_000_000 : 1_000,
      accumulatedVolume: 1_000_000,
      receivedAt: new Date().toISOString()
    };

    this.playTrade(sampleTrade);
  }

  private getFrequency(changeRate: number): number {
    const clampedRate = Math.max(-10, Math.min(10, changeRate));

    return 440 + clampedRate * 36;
  }

  private getTradeVolume(tradeVolume: number): number {
    const volumeBoost = Math.min(
      0.2,
      tradeVolume / 1_000_000
    );

    return Math.min(
      0.4,
      this.volume + volumeBoost
    );
  }

  private getAudioContext(): AudioContext {
    this.audioContext ??= new AudioContext();
    return this.audioContext;
  }
}