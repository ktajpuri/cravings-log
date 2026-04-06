import { describe, it, expect } from "vitest";
import { computePeakHour } from "@/lib/push";

function makeCravings(hours: number[]) {
  return hours.map((h) => {
    const d = new Date("2024-01-01T00:00:00Z");
    d.setUTCHours(h);
    return { createdAt: d };
  });
}

describe("computePeakHour", () => {
  it("returns null when fewer than minSamples cravings", () => {
    expect(computePeakHour(makeCravings([9, 9, 9, 9]))).toBeNull();
  });

  it("returns the hour with the most cravings", () => {
    // 9 appears 4×, 14 appears 3×, 21 appears 2× — plus one extra at 9 to hit minSamples
    const cravings = makeCravings([9, 9, 9, 9, 14, 14, 14, 21, 21, 9]);
    expect(computePeakHour(cravings)).toBe(9);
  });

  it("returns the first peak hour when there is a tie", () => {
    // 8 and 20 each appear 3×, total 6 — tie resolved by first occurrence
    const cravings = makeCravings([8, 8, 8, 20, 20, 20]);
    expect(computePeakHour(cravings)).toBe(8);
  });

  it("respects a custom minSamples threshold", () => {
    const cravings = makeCravings([10, 10, 10]);
    expect(computePeakHour(cravings, 3)).toBe(10);
    expect(computePeakHour(cravings, 4)).toBeNull();
  });

  it("returns null for an empty array", () => {
    expect(computePeakHour([])).toBeNull();
  });
});
