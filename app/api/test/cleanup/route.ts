import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Only available when AUTH_TEST_MODE=true — deletes all E2E test users and their data.
export async function DELETE() {
  if (process.env.AUTH_TEST_MODE !== "true") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  await prisma.user.deleteMany({
    where: { email: { endsWith: "@test.cravingslog" } },
  });

  return NextResponse.json({ ok: true });
}
