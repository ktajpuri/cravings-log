import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

const TEST_EMAIL = "craving-test@test.cravingslog";

test.beforeEach(async ({ page }) => {
  await loginAsTestUser(page, TEST_EMAIL);
});

test.describe("Log a craving", () => {
  test("form is visible on dashboard", async ({ page }) => {
    await expect(page.getByText("Log a craving")).toBeVisible();
    await expect(page.getByText("Intensity")).toBeVisible();
  });

  test("can select a trigger chip", async ({ page }) => {
    await page.waitForSelector("button:has-text('stress')", { timeout: 5000 });
    await page.getByRole("button", { name: "stress" }).click();
    await expect(page.getByRole("button", { name: "stress" })).toBeVisible();
  });

  test("submitting a craving opens the 4Ds modal", async ({ page }) => {
    await page.locator('input[type="range"]').fill("7");
    await page.waitForSelector("button:has-text('stress')", { timeout: 5000 });
    await page.getByRole("button", { name: "stress" }).click();
    await page.getByRole("button", { name: /log craving/i }).click();

    await expect(page.getByText("The 4Ds")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Drink Water")).toBeVisible();
  });

  test("closing the 4Ds modal adds craving to the list", async ({ page }) => {
    await page.locator('input[type="range"]').fill("5");
    await page.getByRole("button", { name: /log craving/i }).click();
    await page.waitForSelector("text=The 4Ds");

    // Close via the X button
    await page.locator('[aria-label="4Ds craving relief"] button').first().click();

    // Dashboard should show the craving in the list
    await expect(page.getByText("Recent cravings")).toBeVisible();
  });

  test("can advance through Drink Water step", async ({ page }) => {
    await page.locator('input[type="range"]').fill("5");
    await page.getByRole("button", { name: /log craving/i }).click();
    await page.waitForSelector("text=The 4Ds");

    // Should be on Drink Water step
    await expect(page.getByText("Drink a full glass of water")).toBeVisible();

    // Advance with the CTA
    await page.getByRole("button", { name: /i drank water/i }).click();

    // Should advance to Delay step
    await expect(page.getByText("Delay for 5 minutes")).toBeVisible();
  });

  test("can skip to the end and mark as resisted", async ({ page }) => {
    await page.locator('input[type="range"]').fill("6");
    await page.getByRole("button", { name: /log craving/i }).click();
    await page.waitForSelector("text=The 4Ds");

    // Skip all 4 steps
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: /skip this step/i }).click();
    }

    // Completion screen
    await expect(page.getByRole("button", { name: /mark craving as resisted/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /mark craving as resisted/i }).click();

    // Modal should close
    await expect(page.getByText("The 4Ds")).not.toBeVisible();
  });
});
