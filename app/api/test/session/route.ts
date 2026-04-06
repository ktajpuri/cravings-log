import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Creates a real DB session for E2E tests, bypassing OAuth entirely.
// Only available when AUTH_TEST_MODE=true — never exposed in production.
export async function POST(req: NextRequest) {
  if (process.env.AUTH_TEST_MODE !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const { email, name } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: name ?? "Test User", emailVerified: new Date() },
  });

  const sessionToken = crypto.randomUUID();
  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  return NextResponse.json({ sessionToken });
}
