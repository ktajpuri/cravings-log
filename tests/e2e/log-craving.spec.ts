import { test, expect } from "@playwright/test";
import { loginAsTestUser, waitForFormReady } from "./helpers/auth";

const TEST_EMAIL = "craving-test@test.cravingslog";

test.beforeEach(async ({ page }) => {
  await loginAsTestUser(page, TEST_EMAIL);
  // Wait for the form to be fully loaded (options chips loaded from API)
  // before any test interaction — prevents "element detached" race conditions
  await waitForFormReady(page);
});

test.describe("Log a craving", () => {
  test("form is visible on dashboard", async ({ page }) => {
    await expect(page.getByText("Log a craving")).toBeVisible();
    await expect(page.getByText("Intensity", { exact: true })).toBeVisible();
  });

  test("can select a trigger chip", async ({ page }) => {
    await page.getByRole("button", { name: "stress" }).click();
    await expect(page.getByRole("button", { name: "stress" })).toBeVisible();
  });

  test("submitting a craving opens the 4Ds modal", async ({ page }) => {
    await page.locator('input[aria-label="Intensity"]').fill("7");
    await page.getByRole("button", { name: "stress" }).click();
    await page.getByRole("button", { name: /log craving/i }).click();

    await expect(page.getByText("The 4Ds")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Drink Water")).toBeVisible();
  });

  test("closing the 4Ds modal adds craving to the list", async ({ page }) => {
    await page.locator('input[aria-label="Intensity"]').fill("5");
    await page.getByRole("button", { name: /log craving/i }).click();
    await page.waitForSelector("text=The 4Ds");

    await page.locator('[aria-label="4Ds craving relief"] button').first().click();
    await expect(page.getByText("Recent cravings")).toBeVisible();
  });

  test("can advance through Drink Water step", async ({ page }) => {
    await page.locator('input[aria-label="Intensity"]').fill("5");
    await page.getByRole("button", { name: /log craving/i }).click();
    await page.waitForSelector("text=The 4Ds");

    await expect(page.getByText("Drink a full glass of water")).toBeVisible();
    await page.getByRole("button", { name: /i drank water/i }).click();
    await expect(page.getByText("Delay for 5 minutes")).toBeVisible();
  });

  test("can skip to the end and mark as resisted", async ({ page }) => {
    await page.locator('input[aria-label="Intensity"]').fill("6");
    await page.getByRole("button", { name: /log craving/i }).click();
    await page.waitForSelector("text=The 4Ds");

    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: /skip this step/i }).click();
    }

    await expect(page.getByRole("button", { name: /mark craving as resisted/i })).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /mark craving as resisted/i }).click();
    await expect(page.locator('[aria-label="4Ds craving relief"]')).not.toBeVisible();
  });
});
