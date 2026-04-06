import { request } from "@playwright/test";

export default async function globalSetup() {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
  const context = await request.newContext({ baseURL });
  await context.delete("/api/test/cleanup").catch(() => {
    // Cleanup endpoint may not be reachable yet — that's OK,
    // each spec handles its own setup
  });
  await context.dispose();
}
