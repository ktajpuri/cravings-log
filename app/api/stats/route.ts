import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const allCravings = await prisma.craving.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  const total = allCravings.length;
  const resisted = allCravings.filter((c) => c.resisted).length;
  const resistanceRate =
    total > 0 ? Math.round((resisted / total) * 100) : 0;

  // Average intensity
  const avgIntensity =
    total > 0
      ? Math.round((allCravings.reduce((sum, c) => sum + c.intensity, 0) / total) * 10) / 10
      : 0;

  // Most common trigger
  const triggerMap: Record<string, number> = {};
  for (const c of allCravings) {
    if (c.trigger) triggerMap[c.trigger] = (triggerMap[c.trigger] ?? 0) + 1;
  }
  const mostCommonTrigger =
    Object.entries(triggerMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Today's count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = allCravings.filter((c) => new Date(c.createdAt) >= today).length;

  // Streak: consecutive days with no smoking (all cravings resisted)
  // Group cravings by calendar day
  const dayMap: Record<string, boolean[]> = {};
  for (const c of allCravings) {
    const day = new Date(c.createdAt).toISOString().split("T")[0];
    if (!dayMap[day]) dayMap[day] = [];
    dayMap[day].push(c.resisted);
  }

  let streak = 0;
  const checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  while (true) {
    const key = checkDate.toISOString().split("T")[0];
    const dayEntries = dayMap[key];
    if (!dayEntries || dayEntries.every((r) => r)) {
      // Either no cravings logged (clean day) or all resisted
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
    if (streak > 365) break; // safety cap
  }

  return NextResponse.json({
    totalCravings: total,
    resistedCount: resisted,
    resistanceRate: `${resistanceRate}%`,
    averageIntensity: avgIntensity,
    mostCommonTrigger,
    todayCount,
    currentStreak: streak,
  });
}
