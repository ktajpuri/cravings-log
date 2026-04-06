import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/cravings/[id] — update a craving
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.craving.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.craving.update({
    where: { id: params.id },
    data: {
      intensity: body.intensity !== undefined ? Number(body.intensity) : undefined,
      trigger: body.trigger !== undefined ? body.trigger : undefined,
      notes: body.notes !== undefined ? body.notes : undefined,
      resisted: body.resisted !== undefined ? Boolean(body.resisted) : undefined,
      location: body.location !== undefined ? body.location : undefined,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/cravings/[id] — delete a craving
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.craving.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.craving.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
