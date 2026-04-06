import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/cravings — list all cravings for the logged-in user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const cravings = await prisma.craving.findMany({
    where: {
      userId: session.user.id,
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(cravings);
}

// POST /api/cravings — log a new craving
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { intensity, trigger, notes, resisted, location } = body;

  if (!intensity || intensity < 1 || intensity > 10) {
    return NextResponse.json(
      { error: "Intensity must be between 1 and 10" },
      { status: 400 }
    );
  }

  const craving = await prisma.craving.create({
    data: {
      userId: session.user.id,
      intensity: Number(intensity),
      trigger: trigger || null,
      notes: notes || null,
      resisted: Boolean(resisted),
      location: location || null,
    },
  });

  return NextResponse.json(craving, { status: 201 });
}
