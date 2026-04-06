import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { webpush, computePeakHour } from "@/lib/push";

export const dynamic = "force-dynamic";

// Called hourly by Vercel Cron.
// Finds users whose craving peak hour matches the current UTC hour
// and sends a push notification to each of their subscriptions.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const currentHour = new Date().getUTCHours();

  // Load all users who have at least one push subscription
  const usersWithSubs = await prisma.user.findMany({
    where: { pushSubscriptions: { some: {} } },
    select: {
      id: true,
      pushSubscriptions: { select: { endpoint: true, p256dh: true, auth: true } },
      cravings: { select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 60 },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const user of usersWithSubs) {
    const peakHour = computePeakHour(user.cravings);
    if (peakHour !== currentHour) { skipped++; continue; }

    const payload = JSON.stringify({
      title: "CravingLog — heads up",
      body: "This is usually when cravings hit. 4Ds are ready if you need them.",
      url: "/dashboard",
    });

    for (const sub of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent++;
      } catch (err: unknown) {
        // Subscription expired or invalid — clean it up
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
        }
      }
    }
  }

  return NextResponse.json({ sent, skipped });
}
