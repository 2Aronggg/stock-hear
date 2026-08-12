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
    const directionOffset = trade.changeRate * 18;
    const volumeBoost = Math.min(0.2, trade.tradeVolume / 1_000_000);

    oscillator.frequency.value = Math.max(180, Math.min(1200, 440 + directionOffset));
    gain.gain.value = Math.min(0.4, this.volume + volumeBoost);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);
  }

  playSample(direction: "up" | "down" | "flat", volume: "low" | "high" = "low"): void {
    const sampleTrade: RealtimeTrade = {
      symbol: "SAMPLE",
      stockName: "샘플",
      tradeTime: "000000",
      currentPrice: 10000,
      changePrice: direction === "up" ? 100 : direction === "down" ? -100 : 0,
      changeRate: direction === "up" ? 1.2 : direction === "down" ? -1.2 : 0,
      tradeVolume: volume === "high" ? 1_000_000 : 1_000,
      accumulatedVolume: 1_000_000,
      receivedAt: new Date().toISOString()
    };

    this.playTrade(sampleTrade);
  }

  private getAudioContext(): AudioContext {
    this.audioContext ??= new AudioContext();
    return this.audioContext;
  }
}

