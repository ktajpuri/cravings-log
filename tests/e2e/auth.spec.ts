import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Authentication", () => {
  test("redirects unauthenticated users from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders sign-in options", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });

  test("signs in with test credentials and lands on dashboard", async ({ page }) => {
    await loginAsTestUser(page, "auth-test@test.cravingslog");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/log a craving/i)).toBeVisible();
  });

  test("session persists on page reload", async ({ page }) => {
    await loginAsTestUser(page, "persist-test@test.cravingslog");
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("sign out returns to login", async ({ page }) => {
    await loginAsTestUser(page, "signout-test@test.cravingslog");
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
