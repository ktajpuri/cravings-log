import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SEED_TRIGGERS = [
  "stress", "after coffee", "boredom", "after eating",
  "social", "alcohol", "anxiety", "habit", "other",
];

const SEED_LOCATIONS = [
  "home", "office", "outside", "car", "bar/restaurant", "balcony", "other",
];

// GET /api/options?type=trigger|location
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = new URL(req.url).searchParams.get("type");
  if (type !== "trigger" && type !== "location") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const userId = session.user.id;
  const existing = await prisma.userOption.findMany({
    where: { userId, type },
    orderBy: { createdAt: "asc" },
  });

  if (existing.length === 0) {
    const seeds = type === "trigger" ? SEED_TRIGGERS : SEED_LOCATIONS;
    await prisma.userOption.createMany({
      data: seeds.map((value) => ({ userId, type, value })),
      skipDuplicates: true,
    });
    return NextResponse.json({ options: seeds });
  }

  return NextResponse.json({ options: existing.map((o) => o.value) });
}

// POST /api/options — add a custom option
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, value } = body;

  if ((type !== "trigger" && type !== "location") || !value?.trim()) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const userId = session.user.id;
  const trimmed = value.trim().toLowerCase();

  await prisma.userOption.upsert({
    where: { userId_type_value: { userId, type, value: trimmed } },
    create: { userId, type, value: trimmed },
    update: {},
  });

  return NextResponse.json({ value: trimmed });
}
