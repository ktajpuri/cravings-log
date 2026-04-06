import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userOption: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GET, POST } from "@/app/api/options/route";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFindMany = prisma.userOption.findMany as ReturnType<typeof vi.fn>;
const mockCreateMany = prisma.userOption.createMany as ReturnType<typeof vi.fn>;
const mockUpsert = prisma.userOption.upsert as ReturnType<typeof vi.fn>;

const SESSION = { user: { id: "user-123" } };

beforeEach(() => vi.clearAllMocks());

describe("GET /api/options", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/options?type=trigger");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing type param", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const req = new NextRequest("http://localhost/api/options");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid type param", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const req = new NextRequest("http://localhost/api/options?type=invalid");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("seeds defaults and returns them on first visit", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([]); // no existing options
    mockCreateMany.mockResolvedValue({ count: 9 });
    const req = new NextRequest("http://localhost/api/options?type=trigger");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockCreateMany).toHaveBeenCalled();
    const body = await res.json();
    expect(body.options).toContain("stress");
    expect(body.options).toContain("other");
  });

  it("returns existing options without seeding on subsequent visits", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const existing = [
      { value: "stress" },
      { value: "boredom" },
      { value: "other" },
    ];
    mockFindMany.mockResolvedValue(existing);
    const req = new NextRequest("http://localhost/api/options?type=trigger");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockCreateMany).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.options).toEqual(["stress", "boredom", "other"]);
  });

  it("works for type=location", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([]);
    mockCreateMany.mockResolvedValue({ count: 7 });
    const req = new NextRequest("http://localhost/api/options?type=location");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.options).toContain("home");
    expect(body.options).toContain("balcony");
  });
});

describe("POST /api/options", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/options", {
      method: "POST",
      body: JSON.stringify({ type: "trigger", value: "gym" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid type", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const req = new NextRequest("http://localhost/api/options", {
      method: "POST",
      body: JSON.stringify({ type: "invalid", value: "gym" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty value", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const req = new NextRequest("http://localhost/api/options", {
      method: "POST",
      body: JSON.stringify({ type: "trigger", value: "   " }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("saves trimmed, lowercased value", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockUpsert.mockResolvedValue({ value: "after gym" });
    const req = new NextRequest("http://localhost/api/options", {
      method: "POST",
      body: JSON.stringify({ type: "trigger", value: "  After Gym  " }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ value: "after gym" }),
      })
    );
    expect(await res.json()).toEqual({ value: "after gym" });
  });
});
