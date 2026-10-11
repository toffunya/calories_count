// Magnitude is orientation-independent. Require a short walking cadence before counting.
export class StepDetector {
  private gravity = 9.81;
  private armed = true;
  private lastPeak = -Infinity;
  private streak = 0;
  reset() {
    this.gravity = 9.81;
    this.armed = true;
    this.lastPeak = -Infinity;
    this.streak = 0;
  }

  sample(x: number, y: number, z: number, time: number): number {
    if (![x, y, z, time].every(Number.isFinite))
      return 0;
    const magnitude = Math.hypot(x, y, z);
    this.gravity = this.gravity * 0.92 + magnitude * 0.08;
    const signal = magnitude - this.gravity;
    if (signal < 0.35)
      this.armed = true;
    if (!this.armed || signal < 1.15 || signal > 8)
      return 0;
    this.armed = false;
    const interval = time - this.lastPeak;
    if (interval < 300)
      return 0;
    this.lastPeak = time;
    this.streak = interval <= 1600 ? this.streak + 1 : 1;
    return this.streak === 3 ? 3 : this.streak > 3 ? 1 : 0;
  }
}
