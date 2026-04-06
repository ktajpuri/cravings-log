import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "./helpers/auth";

test.describe("Craving management", () => {
  test("can delete a craving", async ({ page }) => {
    await loginAsTestUser(page, "delete-test@test.cravingslog");

    // Log a craving first
    await page.locator('input[type="range"]').fill("4");
    await page.getByRole("button", { name: /log craving/i }).click();
    await page.waitForSelector("text=The 4Ds");
    await page.getByRole("button", { name: /close/i }).first().click();

    // Wait for the craving to appear in the list then delete it
    const deleteBtn = page.getByRole("button", { name: /delete/i }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();

    // The craving item should be removed
    await expect(deleteBtn).not.toBeVisible({ timeout: 3000 });
  });

  test("user A cannot see user B's cravings", async ({ browser }) => {
    // Create two separate browser contexts (two users)
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await loginAsTestUser(pageA, "usera@test.cravingslog", "User A");
    await loginAsTestUser(pageB, "userb@test.cravingslog", "User B");

    // User A logs a craving with a note
    await pageA.locator('input[type="range"]').fill("9");
    await pageA.fill("textarea", "This is User A's private note");
    await pageA.getByRole("button", { name: /log craving/i }).click();
    await pageA.waitForSelector("text=The 4Ds");
    await pageA.getByRole("button", { name: /close/i }).first().click();

    // User B reloads and should NOT see User A's note
    await pageB.reload();
    await expect(pageB.getByText("This is User A's private note")).not.toBeVisible();

    await contextA.close();
    await contextB.close();
  });
});
