import { Page } from "@playwright/test";

// Creates a session directly in the DB and sets the cookie — bypasses the
// NextAuth signin UI entirely. Required because NextAuth v5 credentials
// providers are incompatible with database session strategy.
export async function loginAsTestUser(
  page: Page,
  email = "testuser@test.cravingslog",
  name = "Test User"
) {
  const baseURL = page.context().browser()?.contexts()[0]?.pages()[0]?.url()
    ? new URL(page.context().browser()!.contexts()[0].pages()[0].url()).origin
    : "http://localhost:3000";

  const res = await page.request.post("/api/test/session", {
    data: { email, name },
  });

  if (!res.ok()) throw new Error(`Failed to create test session: ${res.status()}`);

  const { sessionToken } = await res.json();

  // NextAuth v5 uses "authjs.session-token" as the cookie name
  await page.context().addCookies([
    {
      name: "authjs.session-token",
      value: sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/dashboard");
  await page.waitForURL("**/dashboard", { timeout: 10_000 });
}
