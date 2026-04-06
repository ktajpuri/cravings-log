import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Hoisted mocks
vi.mock("@/lib/prisma", () => ({
  prisma: {
    craving: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GET, POST } from "@/app/api/cravings/route";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFindMany = prisma.craving.findMany as ReturnType<typeof vi.fn>;
const mockCreate = prisma.craving.create as ReturnType<typeof vi.fn>;

const SESSION = { user: { id: "user-123" } };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/cravings", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/cravings");
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns 401 when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} });
    const req = new NextRequest("http://localhost/api/cravings");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("fetches cravings for the authenticated user", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([]);
    const req = new NextRequest("http://localhost/api/cravings");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: "user-123" }) })
    );
  });

  it("passes limit param as take", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([]);
    const req = new NextRequest("http://localhost/api/cravings?limit=10");
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
  });

  it("passes date range filters when provided", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([]);
    const req = new NextRequest(
      "http://localhost/api/cravings?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z"
    );
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ createdAt: expect.any(Object) }),
      })
    );
  });

  it("returns the cravings array from prisma", async () => {
    const fakeCravings = [{ id: "c1", intensity: 5 }];
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue(fakeCravings);
    const req = new NextRequest("http://localhost/api/cravings");
    const res = await GET(req);
    expect(await res.json()).toEqual(fakeCravings);
  });
});

describe("POST /api/cravings", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/cravings", {
      method: "POST",
      body: JSON.stringify({ intensity: 5 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when intensity is missing", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const req = new NextRequest("http://localhost/api/cravings", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when intensity is 0", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const req = new NextRequest("http://localhost/api/cravings", {
      method: "POST",
      body: JSON.stringify({ intensity: 0 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when intensity is 11", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const req = new NextRequest("http://localhost/api/cravings", {
      method: "POST",
      body: JSON.stringify({ intensity: 11 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates craving with correct data and returns 201", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const created = { id: "new-id", intensity: 7, userId: "user-123", resisted: false };
    mockCreate.mockResolvedValue(created);
    const req = new NextRequest("http://localhost/api/cravings", {
      method: "POST",
      body: JSON.stringify({ intensity: 7, trigger: "stress", location: "home", resisted: false }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-123",
          intensity: 7,
          trigger: "stress",
          location: "home",
          resisted: false,
        }),
      })
    );
    expect(await res.json()).toMatchObject({ id: "new-id" });
  });

  it("coerces resisted string to boolean", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockCreate.mockResolvedValue({ id: "x" });
    const req = new NextRequest("http://localhost/api/cravings", {
      method: "POST",
      body: JSON.stringify({ intensity: 5, resisted: "true" }),
    });
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ resisted: true }) })
    );
  });

  it("sets null for empty optional fields", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockCreate.mockResolvedValue({ id: "x" });
    const req = new NextRequest("http://localhost/api/cravings", {
      method: "POST",
      body: JSON.stringify({ intensity: 5 }),
    });
    await POST(req);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ trigger: null, notes: null, location: null }),
      })
    );
  });
});
