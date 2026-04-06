import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    craving: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PATCH, DELETE } from "@/app/api/cravings/[id]/route";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.craving.findUnique as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.craving.update as ReturnType<typeof vi.fn>;
const mockDelete = prisma.craving.delete as ReturnType<typeof vi.fn>;

const SESSION = { user: { id: "user-123" } };
const PARAMS = { params: { id: "craving-abc" } };
const OWNED_CRAVING = { id: "craving-abc", userId: "user-123", intensity: 5 };

beforeEach(() => vi.clearAllMocks());

describe("PATCH /api/cravings/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/cravings/craving-abc", {
      method: "PATCH",
      body: JSON.stringify({ resisted: true }),
    });
    const res = await PATCH(req, PARAMS);
    expect(res.status).toBe(401);
  });

  it("returns 404 when craving not found", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/cravings/craving-abc", {
      method: "PATCH",
      body: JSON.stringify({ resisted: true }),
    });
    const res = await PATCH(req, PARAMS);
    expect(res.status).toBe(404);
  });

  it("returns 404 when craving belongs to a different user", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindUnique.mockResolvedValue({ id: "craving-abc", userId: "other-user" });
    const req = new NextRequest("http://localhost/api/cravings/craving-abc", {
      method: "PATCH",
      body: JSON.stringify({ resisted: true }),
    });
    const res = await PATCH(req, PARAMS);
    expect(res.status).toBe(404);
  });

  it("updates and returns the craving", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindUnique.mockResolvedValue(OWNED_CRAVING);
    const updated = { ...OWNED_CRAVING, resisted: true };
    mockUpdate.mockResolvedValue(updated);
    const req = new NextRequest("http://localhost/api/cravings/craving-abc", {
      method: "PATCH",
      body: JSON.stringify({ resisted: true }),
    });
    const res = await PATCH(req, PARAMS);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ resisted: true });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "craving-abc" } })
    );
  });
});

describe("DELETE /api/cravings/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/cravings/craving-abc", { method: "DELETE" });
    const res = await DELETE(req, PARAMS);
    expect(res.status).toBe(401);
  });

  it("returns 404 when craving not found", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/cravings/craving-abc", { method: "DELETE" });
    const res = await DELETE(req, PARAMS);
    expect(res.status).toBe(404);
  });

  it("returns 404 when craving belongs to a different user", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindUnique.mockResolvedValue({ id: "craving-abc", userId: "other-user" });
    const req = new NextRequest("http://localhost/api/cravings/craving-abc", { method: "DELETE" });
    const res = await DELETE(req, PARAMS);
    expect(res.status).toBe(404);
  });

  it("deletes the craving and returns success", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindUnique.mockResolvedValue(OWNED_CRAVING);
    mockDelete.mockResolvedValue(OWNED_CRAVING);
    const req = new NextRequest("http://localhost/api/cravings/craving-abc", { method: "DELETE" });
    const res = await DELETE(req, PARAMS);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "craving-abc" } });
  });
});
