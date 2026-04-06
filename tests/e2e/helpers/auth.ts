import { Page } from "@playwright/test";

export async function loginAsTestUser(
  page: Page,
  email = "testuser@test.cravingslog",
  name = "Test User"
) {
  // Go directly to the credentials provider form — skips the provider list page
  // and avoids brittle link/button selectors that vary by NextAuth version.
  await page.goto("/api/auth/signin/test-credentials");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="name"]', name);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 10_000 });
}
