import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/trivia?count=5&category=all
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const count = Math.min(parseInt(searchParams.get("count") ?? "5"), 20);
  const category = searchParams.get("category");

  const where = category && category !== "all" ? { category } : {};

  // Use ORDER BY RANDOM() for true DB-level randomness
  const questions = await prisma.$queryRawUnsafe<
    { id: string; question: string; answers: string[]; correct: number; category: string; type: string; difficulty: number }[]
  >(
    category && category !== "all"
      ? `SELECT id, question, answers, correct, category, type, difficulty FROM "TriviaQuestion" WHERE category = $1 ORDER BY RANDOM() LIMIT $2`
      : `SELECT id, question, answers, correct, category, type, difficulty FROM "TriviaQuestion" ORDER BY RANDOM() LIMIT $1`,
    ...(category && category !== "all" ? [category, count] : [count])
  );

  // Prisma returns BigInt for Int columns via raw queries on some drivers — normalise
  const normalised = questions.map((q) => ({
    ...q,
    correct: Number(q.correct),
    difficulty: Number(q.difficulty),
  }));

  return NextResponse.json(normalised);
}
