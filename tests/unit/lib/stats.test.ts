import { describe, it, expect } from "vitest";
import { computeStats, CravingRecord } from "@/lib/stats";

// Helper to create a craving record at a given day offset from `now`
function makeCraving(
  daysAgo: number,
  resisted: boolean,
  intensity = 5,
  trigger: string | null = null,
  now: Date = new Date()
): CravingRecord {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(12, 0, 0, 0); // UTC noon — stays on the intended UTC date regardless of local timezone
  return { intensity, trigger, resisted, createdAt: d };
}

describe("computeStats", () => {
  const now = new Date("2024-06-15T12:00:00Z");

  describe("empty input", () => {
    it("returns all zeros for empty array", () => {
      const stats = computeStats([], now);
      expect(stats.totalCravings).toBe(0);
      expect(stats.resistedCount).toBe(0);
      expect(stats.resistanceRate).toBe("0%");
      expect(stats.averageIntensity).toBe(0);
      expect(stats.mostCommonTrigger).toBeNull();
      expect(stats.todayCount).toBe(0);
      expect(stats.currentStreak).toBe(0);
    });
  });

  describe("resistanceRate", () => {
    it("is 100% when all cravings resisted", () => {
      const cravings = [makeCraving(0, true, 5, null, now), makeCraving(0, true, 5, null, now)];
      expect(computeStats(cravings, now).resistanceRate).toBe("100%");
    });

    it("is 0% when no cravings resisted", () => {
      const cravings = [makeCraving(0, false, 5, null, now)];
      expect(computeStats(cravings, now).resistanceRate).toBe("0%");
    });

    it("rounds to nearest integer", () => {
      // 1 resisted out of 3 = 33.33% → "33%"
      const cravings = [
        makeCraving(0, true, 5, null, now),
        makeCraving(0, false, 5, null, now),
        makeCraving(0, false, 5, null, now),
      ];
      expect(computeStats(cravings, now).resistanceRate).toBe("33%");
    });
  });

  describe("averageIntensity", () => {
    it("calculates correctly with one decimal place", () => {
      const cravings = [
        makeCraving(0, true, 7, null, now),
        makeCraving(0, true, 8, null, now),
      ];
      expect(computeStats(cravings, now).averageIntensity).toBe(7.5);
    });

    it("rounds to 1 decimal", () => {
      const cravings = [1, 2, 3].map((i) => makeCraving(0, true, i, null, now));
      expect(computeStats(cravings, now).averageIntensity).toBe(2);
    });

    it("is 0 for empty array", () => {
      expect(computeStats([], now).averageIntensity).toBe(0);
    });
  });

  describe("mostCommonTrigger", () => {
    it("returns null when no triggers set", () => {
      const cravings = [makeCraving(0, true, 5, null, now)];
      expect(computeStats(cravings, now).mostCommonTrigger).toBeNull();
    });

    it("returns the most frequent trigger", () => {
      const cravings = [
        makeCraving(0, true, 5, "stress", now),
        makeCraving(0, true, 5, "stress", now),
        makeCraving(0, true, 5, "boredom", now),
      ];
      expect(computeStats(cravings, now).mostCommonTrigger).toBe("stress");
    });

    it("ignores null triggers in count", () => {
      const cravings = [
        makeCraving(0, true, 5, null, now),
        makeCraving(0, true, 5, null, now),
        makeCraving(0, true, 5, "stress", now),
      ];
      expect(computeStats(cravings, now).mostCommonTrigger).toBe("stress");
    });
  });

  describe("todayCount", () => {
    it("counts only cravings from today", () => {
      const cravings = [
        makeCraving(0, true, 5, null, now),  // today
        makeCraving(0, true, 5, null, now),  // today
        makeCraving(1, true, 5, null, now),  // yesterday
      ];
      expect(computeStats(cravings, now).todayCount).toBe(2);
    });

    it("is 0 when all cravings are from previous days", () => {
      const cravings = [makeCraving(1, true, 5, null, now)];
      expect(computeStats(cravings, now).todayCount).toBe(0);
    });
  });

  describe("currentStreak", () => {
    it("is 0 for a new user with no cravings", () => {
      // The fix: no cravings = no earliest date = streak doesn't extend past today
      expect(computeStats([], now).currentStreak).toBe(0);
    });

    it("is 1 when today has only resisted cravings", () => {
      const cravings = [makeCraving(0, true, 5, null, now)];
      expect(computeStats(cravings, now).currentStreak).toBe(1);
    });

    it("is 0 when today has an unresisted craving", () => {
      const cravings = [makeCraving(0, false, 5, null, now)];
      expect(computeStats(cravings, now).currentStreak).toBe(0);
    });

    it("spans consecutive resisted days", () => {
      const cravings = [
        makeCraving(0, true, 5, null, now),  // today
        makeCraving(1, true, 5, null, now),  // yesterday
        makeCraving(2, true, 5, null, now),  // 2 days ago
      ];
      expect(computeStats(cravings, now).currentStreak).toBe(3);
    });

    it("breaks streak on first unresisted day", () => {
      const cravings = [
        makeCraving(0, true, 5, null, now),  // today — resisted
        makeCraving(1, true, 5, null, now),  // yesterday — resisted
        makeCraving(2, false, 5, null, now), // 2 days ago — not resisted → breaks streak
        makeCraving(3, true, 5, null, now),  // 3 days ago — resisted (but streak already broken)
      ];
      expect(computeStats(cravings, now).currentStreak).toBe(2);
    });

    it("counts no-craving days between today and earliest craving as clean", () => {
      // 1 resisted craving 5 days ago. Days 0–4 have no cravings = clean days.
      // Streak = 6 (today + 4 clean days + the resisted day).
      const cravings = [makeCraving(5, true, 5, null, now)];
      expect(computeStats(cravings, now).currentStreak).toBe(6);
    });

    it("counts a day with no cravings between resisted days as clean", () => {
      // Today: resisted; yesterday: no cravings (clean); 2 days ago: resisted
      const cravings = [
        makeCraving(0, true, 5, null, now),
        makeCraving(2, true, 5, null, now),
      ];
      // Yesterday is between today and 2 days ago — it's a clean day
      expect(computeStats(cravings, now).currentStreak).toBe(3);
    });

    it("never exceeds 365", () => {
      // Create 400 days of resisted cravings
      const cravings = Array.from({ length: 400 }, (_, i) =>
        makeCraving(i, true, 5, null, now)
      );
      expect(computeStats(cravings, now).currentStreak).toBeLessThanOrEqual(365);
    });
  });
});
