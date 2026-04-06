import { Page } from "@playwright/test";

export async function loginAsTestUser(
  page: Page,
  email = "testuser@test.cravingslog",
  name = "Test User"
) {
  await page.goto("/api/auth/signin");
  // Click the "Test" credentials provider button
  await page.getByRole("link", { name: /test/i }).click();
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="name"]', name);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 10_000 });
}
