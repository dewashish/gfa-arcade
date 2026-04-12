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

test("Save plan → see it in Library", async ({ page }) => {
  // Capture console errors and network failures
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("response", (resp) => {
    if (resp.status() >= 400) {
      networkErrors.push(`${resp.status()} ${resp.url().slice(0, 120)}`);
    }
  });

  // 1. Login
  await loginAsTeacher(page);
  console.log("✓ Logged in");

  // 2. Go to bank and add 2 activities
  await page.goto(`${BASE}/bank`);
  await page.waitForSelector("article", { timeout: 15000 });
  const addButtons = page.locator('button[aria-label*="Add"][aria-label*="class plan"]');
  await addButtons.nth(0).click();
  await page.waitForTimeout(500);
  await addButtons.nth(1).click();
  await page.waitForTimeout(500);
  console.log("✓ Added 2 activities to tray");

  // 3. Name the plan
  const tray = page.locator('aside:not([aria-label="Primary navigation"])');
  await expect(tray).toBeVisible({ timeout: 5000 });
  const nameInput = tray.locator('input[placeholder*="Plan name"]');
  await nameInput.clear();
  const planName = `Test Plan ${Date.now()}`;
  await nameInput.fill(planName);
  console.log(`✓ Named plan: ${planName}`);

  // 4. Click Save Plan and watch for errors
  const saveBtn = tray.getByText("Save Plan");
  await saveBtn.click();
  console.log("✓ Clicked Save Plan");

  // Wait for save to complete
  await page.waitForTimeout(3000);

  // Check for errors
  const errorEl = tray.locator(".bg-error-container");
  if (await errorEl.isVisible({ timeout: 1000 }).catch(() => false)) {
    const errorText = await errorEl.textContent();
    console.log("❌ Save Error in UI:", errorText);
  }

  if (consoleErrors.length > 0) {
    console.log("❌ Console errors:", JSON.stringify(consoleErrors));
  }
  if (networkErrors.length > 0) {
    console.log("❌ Network errors:", JSON.stringify(networkErrors));
  }

  // Check if the footer says "Unsaved changes" or not
  const footerText = await tray.locator("p.text-center").textContent().catch(() => "");
  console.log("Footer text:", footerText);

  // 5. Navigate to Library
  await page.goto(`${BASE}/library`);
  await page.waitForLoadState("networkidle");
  console.log("✓ Navigated to Library");

  // 6. Take screenshot
  await page.screenshot({ path: "test-results/library-plans.png", fullPage: true });
  console.log("✓ Screenshot saved");

  // 7. Check if our plan is visible
  const planHeading = page.getByText("My Class Plans");
  const planVisible = await planHeading.isVisible({ timeout: 5000 }).catch(() => false);
  console.log("My Class Plans section visible:", planVisible);

  if (planVisible) {
    const ourPlan = page.getByText(planName);
    const found = await ourPlan.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Plan "${planName}" found:`, found);
  } else {
    console.log("❌ No 'My Class Plans' section at all");
    // Check page content
    const bodyText = await page.locator("body").textContent();
    console.log("Page content preview:", bodyText?.slice(0, 500));
  }

  // Also check: did the plan actually save to Supabase?
  // Navigate to bank with plan param to see if it loads
  // First, let's check if there are any class_plans by looking at network
  console.log("\nFinal console errors:", consoleErrors.length);
  console.log("Final network errors:", networkErrors.length);
});
