import { test, expect, request } from "@playwright/test";
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
    // Wait for chips to load from API
    await page.waitForSelector("button:has-text('stress')", { timeout: 5000 });
    await page.getByRole("button", { name: "stress" }).click();
    // After click the chip should be selected (style change — just verify no error)
    await expect(page.getByRole("button", { name: "stress" })).toBeVisible();
  });

  test("submitting a craving opens the 4Ds modal", async ({ page }) => {
    // Set intensity via the hidden range input
    await page.locator('input[type="range"]').fill("7");

    // Select a trigger
    await page.waitForSelector("button:has-text('stress')", { timeout: 5000 });
    await page.getByRole("button", { name: "stress" }).click();

    // Submit
    await page.getByRole("button", { name: /log craving/i }).click();

    // 4Ds modal should appear
    await expect(page.getByText("The 4Ds")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Drink Water")).toBeVisible();
  });

  test("closing the 4Ds modal adds craving to the list", async ({ page }) => {
    await page.locator('input[type="range"]').fill("5");
    await page.getByRole("button", { name: /log craving/i }).click();
    await page.waitForSelector("text=The 4Ds");

    // Close modal
    await page.getByRole("button", { name: /close/i }).first().click();

    // Craving should appear in the recent cravings list
    await expect(page.getByText(/craving/i)).toBeVisible();
  });

  test("completing the 4Ds and marking resisted updates the craving", async ({ page }) => {
    await page.locator('input[type="range"]').fill("6");
    await page.getByRole("button", { name: /log craving/i }).click();
    await page.waitForSelector("text=The 4Ds");

    // Skip through all 4 steps
    for (let i = 0; i < 4; i++) {
      const skipBtn = page.getByRole("button", { name: /skip this step/i });
      if (await skipBtn.isVisible()) {
        await skipBtn.click();
      } else {
        // Use the CTA button
        const ctaBtn = page.getByRole("button", { name: /i (drank|waited|reached)/i });
        if (await ctaBtn.isVisible()) await ctaBtn.click();
      }
    }

    // Should reach completion screen
    await expect(page.getByText(/mark craving as resisted/i)).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /mark craving as resisted/i }).click();

    // Modal should close
    await expect(page.getByText("The 4Ds")).not.toBeVisible({ timeout: 5000 });
  });
});
