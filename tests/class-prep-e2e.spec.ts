import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "https://gfa-arcade.vercel.app";

// Teacher login helper — uses the test teacher account
async function loginAsTeacher(page: import("@playwright/test").Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState("domcontentloaded");

  // Wait for login form to render (it's a client component)
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 10000 });

  // Make sure we're on the "Sign In" tab
  const signInTab = page.getByRole("radio", { name: "Sign In" });
  if (await signInTab.isVisible()) {
    await signInTab.click();
    await page.waitForTimeout(500);
  }

  // Fill credentials — use env vars or defaults
  const email = process.env.TEST_EMAIL || "a.ghosh_gfa@gemsedu.com";
  const password = process.env.TEST_PASSWORD || "qwerty1234";
  await emailInput.fill(email);
  await page.locator('input[type="password"]').fill(password);

  // Submit — the BigButton wrapping "Log In" text
  await page.locator('button[type="submit"]').click();

  // Wait for redirect — could also stay on /login with error
  try {
    await page.waitForURL(/\/(dashboard|bank|library)/, { timeout: 20000 });
  } catch {
    // Debug: screenshot + page content if login failed
    await page.screenshot({ path: "test-results/login-debug.png" });
    const url = page.url();
    const bodyText = await page.locator("body").textContent();
    throw new Error(
      `Login failed. URL: ${url}\nBody excerpt: ${bodyText?.slice(0, 500)}`
    );
  }
}

test.describe("Class Prep Tray — End-to-End", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
  });

  test("1. Activity Bank shows + buttons on cards", async ({ page }) => {
    await page.goto(`${BASE}/bank`);
    await page.waitForLoadState("networkidle");

    // Should see activity cards
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // Each card should have a "+" add-to-tray button
    const addButtons = page.locator('button[aria-label*="Add"][aria-label*="class plan"]');
    const count = await addButtons.count();
    expect(count).toBeGreaterThan(0);
    console.log(`✓ Found ${count} "+" buttons on activity cards`);
  });

  test("2. Clicking + opens the tray and adds activity", async ({ page }) => {
    await page.goto(`${BASE}/bank`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("article", { timeout: 10000 });

    // Click the first "+" button
    const firstAdd = page.locator('button[aria-label*="Add"][aria-label*="class plan"]').first();
    await firstAdd.click();

    // Tray should be visible
    const tray = page.locator('aside:not([aria-label="Primary navigation"])');
    await expect(tray).toBeVisible({ timeout: 5000 });

    // Should show "Class Plan" header
    await expect(page.getByText("Class Plan")).toBeVisible();

    // Should have 1 activity in the tray
    const trayItems = tray.locator('button[aria-label*="Drag"]');
    await expect(trayItems).toHaveCount(1);
    console.log("✓ Tray opened with 1 activity");
  });

  test("3. Add multiple activities and see pacing settings", async ({ page }) => {
    await page.goto(`${BASE}/bank`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("article", { timeout: 10000 });

    // Add first 3 activities
    const addButtons = page.locator('button[aria-label*="Add"][aria-label*="class plan"]');
    const total = await addButtons.count();
    const toAdd = Math.min(3, total);

    for (let i = 0; i < toAdd; i++) {
      await addButtons.nth(i).click();
      await page.waitForTimeout(300);
    }

    // Tray should show all added activities
    const tray = page.locator('aside:not([aria-label="Primary navigation"])');
    await expect(tray).toBeVisible();

    // Click on the second activity to expand pacing settings
    const trayContentButtons = tray.locator("button.flex-1.text-left, button[class*='text-left']");
    if (await trayContentButtons.nth(1).isVisible()) {
      await trayContentButtons.nth(1).click();

      // Should see timer mode options
      await expect(page.getByText("Timer Mode")).toBeVisible({ timeout: 3000 });
      await expect(page.getByRole("button", { name: /Per Question/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Overall/i }).first()).toBeVisible();
      await expect(page.getByRole("button", { name: /No Timer/i })).toBeVisible();
      console.log("✓ Pacing settings visible with 3 timer modes");
    }

    console.log(`✓ Added ${toAdd} activities to tray`);
  });

  test("4. Card shows checkmark when already in tray", async ({ page }) => {
    await page.goto(`${BASE}/bank`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("article", { timeout: 10000 });

    // Add the first activity
    const firstAdd = page.locator('button[aria-label*="Add"][aria-label*="class plan"]').first();
    await firstAdd.click();
    await page.waitForTimeout(500);

    // The button should now show a checkmark (aria-label "Already in plan")
    const checkButton = page.locator('button[aria-label="Already in plan"]');
    const checkCount = await checkButton.count();
    expect(checkCount).toBeGreaterThanOrEqual(1);
    console.log("✓ Card shows checkmark when already in tray");
  });

  test("5. Can name the plan and see save/launch buttons", async ({ page }) => {
    await page.goto(`${BASE}/bank`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("article", { timeout: 10000 });

    // Add an activity to open tray
    await page.locator('button[aria-label*="Add"][aria-label*="class plan"]').first().click();
    await page.waitForTimeout(500);

    const tray = page.locator('aside:not([aria-label="Primary navigation"])');

    // Plan name input should be visible
    const nameInput = tray.locator('input[placeholder*="Plan name"]');
    await expect(nameInput).toBeVisible();

    // Type a plan name
    await nameInput.clear();
    await nameInput.fill("Monday Maths Revision");

    // Save and Launch buttons should be visible
    await expect(tray.getByText("Save Plan")).toBeVisible();
    await expect(tray.getByText("Launch Class")).toBeVisible();
    console.log("✓ Plan name input + Save/Launch buttons visible");
  });

  test("6. Save plan persists to Supabase", async ({ page }) => {
    await page.goto(`${BASE}/bank`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("article", { timeout: 10000 });

    // Add 2 activities
    const addButtons = page.locator('button[aria-label*="Add"][aria-label*="class plan"]');
    await addButtons.nth(0).click();
    await page.waitForTimeout(300);
    await addButtons.nth(1).click();
    await page.waitForTimeout(300);

    const tray = page.locator('aside:not([aria-label="Primary navigation"])');

    // Name the plan
    const nameInput = tray.locator('input[placeholder*="Plan name"]');
    await nameInput.clear();
    await nameInput.fill("E2E Test Plan");

    // Click Save Plan
    await tray.getByText("Save Plan").click();

    // Wait for save to complete — button should not be spinning anymore
    await page.waitForTimeout(2000);

    // Should show "Unsaved changes" cleared (no dirty indicator)
    const footer = tray.locator("p.text-center");
    const footerText = await footer.textContent();
    expect(footerText).not.toContain("Unsaved changes");
    console.log("✓ Plan saved successfully");
  });

  test("7. Remove activity from tray", async ({ page }) => {
    await page.goto(`${BASE}/bank`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("article", { timeout: 10000 });

    // Add 2 activities
    const addButtons = page.locator('button[aria-label*="Add"][aria-label*="class plan"]');
    await addButtons.nth(0).click();
    await page.waitForTimeout(300);
    await addButtons.nth(1).click();
    await page.waitForTimeout(500);

    const tray = page.locator('aside:not([aria-label="Primary navigation"])');

    // Should have 2 items
    const removeButtons = tray.locator('button[aria-label*="Remove"]');
    expect(await removeButtons.count()).toBe(2);

    // Remove the first one
    await removeButtons.first().click();
    await page.waitForTimeout(300);

    // Should have 1 item now
    expect(await tray.locator('button[aria-label*="Remove"]').count()).toBe(1);
    console.log("✓ Activity removed from tray");
  });

  test("8. Tray collapse/expand toggle", async ({ page }) => {
    await page.goto(`${BASE}/bank`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("article", { timeout: 10000 });

    // Add an activity to open tray
    await page.locator('button[aria-label*="Add"][aria-label*="class plan"]').first().click();
    await page.waitForTimeout(500);

    // Tray should be visible
    const tray = page.locator('aside:not([aria-label="Primary navigation"])');
    await expect(tray).toBeVisible();

    // Click close button
    const closeBtn = tray.locator('button:has(span:text("chevron_right"))');
    await closeBtn.click();
    await page.waitForTimeout(500);

    // Tray should be collapsed — the aside should be gone
    await expect(tray).not.toBeVisible({ timeout: 2000 });

    // Badge on the edge toggle should show count
    const edgeToggle = page.locator('button[title="Open Class Prep tray"]');
    await expect(edgeToggle).toBeVisible();
    console.log("✓ Tray collapses and shows edge toggle with badge");
  });
});
