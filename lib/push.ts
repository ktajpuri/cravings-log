import webpush from "web-push";

// ─── VAPID setup ──────────────────────────────────────────────────────────────

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:no-reply@cravingslog.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export { webpush };

// ─── Peak-hour computation ────────────────────────────────────────────────────

/**
 * Given a list of craving timestamps, returns the UTC hour (0–23) with the
 * most cravings.  Returns null when there isn't enough data to be meaningful.
 */
export function computePeakHour(
  cravings: { createdAt: Date }[],
  minSamples = 5,
): number | null {
  if (cravings.length < minSamples) return null;

  const counts = new Array<number>(24).fill(0);
  for (const c of cravings) {
    counts[c.createdAt.getUTCHours()]++;
  }

  const max = Math.max(...counts);
  return counts.indexOf(max);
}
