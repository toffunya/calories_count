import { describe, expect, it } from 'vitest';
import { StepDetector } from './step-detector';

describe('stepDetector', () => {
  it('ignores stationary gravity and invalid samples', () => {
    const d = new StepDetector();
    for (let t = 0; t < 10000; t += 20) expect(d.sample(0, 0, 9.81, t)).toBe(0);
    expect(d.sample(Number.NaN, 0, 0, 10000)).toBe(0);
  });
  it('counts a sustained cadence and ignores isolated motion', () => {
    const d = new StepDetector();
    expect(d.sample(0, 0, 12, 0)).toBe(0);
    d.sample(0, 0, 9, 100);
    expect(d.sample(0, 0, 12, 3000)).toBe(0);
    d.sample(0, 0, 9, 3100);
    expect(d.sample(0, 0, 12, 3600)).toBe(0);
    d.sample(0, 0, 9, 3700);
    expect(d.sample(0, 0, 12, 4200)).toBe(3);
    d.sample(0, 0, 9, 4300);
    expect(d.sample(0, 0, 12, 4800)).toBe(1);
    d.reset();
    expect(d.sample(0, 0, 12, 5000)).toBe(0);
  });
  it('rejects rapid repeated peaks', () => {
    const d = new StepDetector();
    for (let t = 0; t < 250; t += 40) {
      expect(d.sample(0, 0, 12, t)).toBe(0);
      d.sample(0, 0, 9, t + 20);
    }
  });
});
