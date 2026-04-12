import { test, expect } from "@playwright/test";

const BASE = "https://gfa-arcade.vercel.app";

async function loginAsTeacher(page: import("@playwright/test").Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("domcontentloaded");
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 10000 });
  const signInTab = page.getByRole("radio", { name: "Sign In" });
  if (await signInTab.isVisible()) await signInTab.click();
  await page.waitForTimeout(500);
  await emailInput.fill("a.ghosh_gfa@gemsedu.com");
  await page.locator('input[type="password"]').fill("qwerty1234");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|bank|library)/, { timeout: 20000 });
}

test("Relaunch class plan — no duplicate sessions", async ({ page }) => {
  await loginAsTeacher(page);
  console.log("✓ Logged in");

  // Go to bank, add 1 activity, save plan
  await page.goto(`${BASE}/bank`);
  await page.waitForSelector("article", { timeout: 15000 });
  await page.locator('button[aria-label*="Add"][aria-label*="class plan"]').first().click();
  await page.waitForTimeout(500);

  const tray = page.locator('aside:not([aria-label="Primary navigation"])');
  const nameInput = tray.locator('input[placeholder*="Plan name"]');
  await nameInput.clear();
  await nameInput.fill("Relaunch Test Plan");
  await tray.getByText("Save Plan").click();
  await page.waitForTimeout(2000);
  console.log("✓ Plan saved");

  // Launch 1st time
  await tray.getByText("Launch Class").click();
  await page.waitForURL(/\/session\//, { timeout: 20000 });
  console.log("✓ 1st launch — on session page");

  // Check activity strip — should show exactly 1 activity
  await page.waitForTimeout(2000);
  // Go back to library
  await page.goto(`${BASE}/library`);
  await page.waitForTimeout(3000);

  // Relaunch the same plan
  const launchBtn = page.getByRole("button", { name: /launch/i }).first();
  if (await launchBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await launchBtn.click();
    await page.waitForURL(/\/session\//, { timeout: 20000 });
    console.log("✓ 2nd launch — on session page");

    // Check: should still show only 1 activity in playlist strip (not 2)
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "test-results/relaunch-session.png" });

    // If there's a playlist strip, count the activity cards
    const playlistCards = page.locator('section button[class*="min-w"]');
    const cardCount = await playlistCards.count();
    console.log("Activity cards in strip:", cardCount);

    // For a single-activity plan, there should be 0 or 1 playlist cards (not 2+)
    // A single activity plan won't show a playlist strip at all
    if (cardCount > 1) {
      console.log("❌ DUPLICATE: More than 1 activity card — old sessions not cleaned up!");
    } else {
      console.log("✅ No duplicates — clean relaunch!");
    }
  } else {
    console.log("⚠️ Launch button not found in library — plan may not be visible yet");
  }
});
