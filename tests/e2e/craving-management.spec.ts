import { test, expect } from "@playwright/test";
import { loginAsTestUser, waitForFormReady } from "./helpers/auth";

test.describe("Craving management", () => {
  test("can delete a craving", async ({ page }) => {
    await loginAsTestUser(page, "delete-test@test.cravingslog");
    await waitForFormReady(page);

    await page.locator('input[aria-label="Intensity"]').fill("4");
    await page.getByRole("button", { name: /log craving/i }).click();
    await page.waitForSelector("text=The 4Ds");
    await page.locator('[aria-label="4Ds craving relief"] button').first().click();

    const deleteBtn = page.getByRole("button", { name: /delete/i }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();
    await expect(deleteBtn).not.toBeVisible({ timeout: 3000 });
  });

  test("user A cannot see user B's cravings", async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await loginAsTestUser(pageA, "usera@test.cravingslog", "User A");
    await loginAsTestUser(pageB, "userb@test.cravingslog", "User B");

    await waitForFormReady(pageA);
    await pageA.locator('input[aria-label="Intensity"]').fill("9");
    await pageA.fill("textarea", "This is User A's private note");
    await pageA.getByRole("button", { name: /log craving/i }).click();
    await pageA.waitForSelector("text=The 4Ds");
    await pageA.locator('[aria-label="4Ds craving relief"] button').first().click();

    await pageB.reload();
    await expect(pageB.getByText("This is User A's private note")).not.toBeVisible();

    await contextA.close();
    await contextB.close();
  });
});
