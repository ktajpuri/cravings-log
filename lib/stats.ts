export interface CravingRecord {
  intensity: number;
  trigger: string | null;
  resisted: boolean;
  createdAt: Date;
}

export interface ComputedStats {
  totalCravings: number;
  resistedCount: number;
  resistanceRate: string;
  averageIntensity: number;
  mostCommonTrigger: string | null;
  todayCount: number;
  currentStreak: number;
}

export function computeStats(cravings: CravingRecord[], now: Date = new Date()): ComputedStats {
  const total = cravings.length;
  const resistedCount = cravings.filter((c) => c.resisted).length;
  const resistanceRate = total > 0 ? Math.round((resistedCount / total) * 100) : 0;

  const averageIntensity =
    total > 0
      ? Math.round((cravings.reduce((sum, c) => sum + c.intensity, 0) / total) * 10) / 10
      : 0;

  // Most common trigger
  const triggerMap: Record<string, number> = {};
  for (const c of cravings) {
    if (c.trigger) triggerMap[c.trigger] = (triggerMap[c.trigger] ?? 0) + 1;
  }
  const mostCommonTrigger =
    Object.entries(triggerMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Today's count — use UTC midnight to avoid timezone drift
  const todayMidnight = new Date(now);
  todayMidnight.setUTCHours(0, 0, 0, 0);
  const todayCount = cravings.filter((c) => new Date(c.createdAt) >= todayMidnight).length;

  // Streak: consecutive days going backward from today where all logged cravings were resisted.
  // Days with no cravings count as clean only back to the earliest craving date,
  // preventing new users with zero data from getting an inflated streak.
  const dayMap: Record<string, boolean[]> = {};
  for (const c of cravings) {
    const day = new Date(c.createdAt).toISOString().split("T")[0]; // UTC date key
    if (!dayMap[day]) dayMap[day] = [];
    dayMap[day].push(c.resisted);
  }

  // Use UTC date string comparison throughout to stay timezone-agnostic
  const earliestKey = cravings.length > 0
    ? new Date(Math.min(...cravings.map((c) => new Date(c.createdAt).getTime())))
        .toISOString().split("T")[0]
    : null;

  let streak = 0;
  const checkDate = new Date(now);
  checkDate.setUTCHours(0, 0, 0, 0);

  while (streak < 365) {
    const key = checkDate.toISOString().split("T")[0];
    const dayEntries = dayMap[key];

    if (!dayEntries) {
      // No cravings on this day — clean only if within the user's history window
      if (earliestKey === null || key < earliestKey) break;
      streak++;
    } else if (dayEntries.every((r) => r)) {
      streak++;
    } else {
      break;
    }

    checkDate.setUTCDate(checkDate.getUTCDate() - 1);
  }

  return {
    totalCravings: total,
    resistedCount,
    resistanceRate: `${resistanceRate}%`,
    averageIntensity,
    mostCommonTrigger,
    todayCount,
    currentStreak: streak,
  };
}
