import { test, expect } from "@playwright/test";

const BASE = "https://gfa-arcade.vercel.app";

test("Launch Class — debug", async ({ page }) => {
  // Login
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
  console.log("✓ Logged in");

  // Go to bank
  await page.goto(`${BASE}/bank`);
  await page.waitForSelector("article", { timeout: 15000 });
  console.log("✓ Bank loaded");

  // Add 2 activities
  const addButtons = page.locator('button[aria-label*="Add"][aria-label*="class plan"]');
  await addButtons.nth(0).click();
  await page.waitForTimeout(500);
  await addButtons.nth(1).click();
  await page.waitForTimeout(500);
  console.log("✓ Added 2 activities to tray");

  // Listen for console errors
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  // Listen for network failures
  const networkErrors: string[] = [];
  page.on("response", (resp) => {
    if (resp.status() >= 400) {
      networkErrors.push(`${resp.status()} ${resp.url()}`);
    }
  });

  // Click Launch Class
  const tray = page.locator('aside:not([aria-label="Primary navigation"])');
  const launchBtn = tray.getByText("Launch Class");
  await expect(launchBtn).toBeVisible();
  await launchBtn.click();
  console.log("✓ Clicked Launch Class");

  // Wait and capture errors
  await page.waitForTimeout(5000);

  // Check for error message in UI
  const errorEl = tray.locator(".bg-error-container");
  if (await errorEl.isVisible({ timeout: 2000 }).catch(() => false)) {
    const errorText = await errorEl.textContent();
    console.log("❌ UI Error:", errorText);
  }

  // Print captured errors
  if (consoleErrors.length > 0) {
    console.log("❌ Console errors:", JSON.stringify(consoleErrors, null, 2));
  }
  if (networkErrors.length > 0) {
    console.log("❌ Network errors:", JSON.stringify(networkErrors, null, 2));
  }

  // Screenshot
  await page.screenshot({ path: "test-results/launch-debug.png", fullPage: true });
  console.log("✓ Screenshot saved to test-results/launch-debug.png");

  // Check if we navigated
  const finalUrl = page.url();
  console.log("Final URL:", finalUrl);
  
  if (finalUrl.includes("/session/")) {
    console.log("✓ SUCCESS — navigated to session monitor");
  } else {
    console.log("❌ FAILED — still on:", finalUrl);
  }
});
