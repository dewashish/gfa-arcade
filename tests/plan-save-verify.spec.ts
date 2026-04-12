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

test("Debug: check class_plans save + library fetch", async ({ page }) => {
  // Track ALL network requests to class_plans
  const classPlansRequests: { method: string; url: string; status: number; body: string }[] = [];

  page.on("response", async (resp) => {
    if (resp.url().includes("class_plans")) {
      let body = "";
      try { body = await resp.text(); } catch {}
      classPlansRequests.push({
        method: resp.request().method(),
        url: resp.url().slice(0, 150),
        status: resp.status(),
        body: body.slice(0, 300),
      });
    }
  });

  await loginAsTeacher(page);
  console.log("✓ Logged in");

  // Go to bank and save a plan
  await page.goto(`${BASE}/bank`);
  await page.waitForSelector("article", { timeout: 15000 });
  
  const addButtons = page.locator('button[aria-label*="Add"][aria-label*="class plan"]');
  await addButtons.nth(0).click();
  await page.waitForTimeout(400);
  await addButtons.nth(1).click();
  await page.waitForTimeout(400);

  const tray = page.locator('aside:not([aria-label="Primary navigation"])');
  const nameInput = tray.locator('input[placeholder*="Plan name"]');
  await nameInput.clear();
  await nameInput.fill("Debug Plan Test");

  // Save
  await tray.getByText("Save Plan").click();
  await page.waitForTimeout(3000);

  console.log("\n=== class_plans requests during SAVE ===");
  for (const r of classPlansRequests) {
    console.log(`  ${r.method} ${r.status} ${r.url}`);
    console.log(`    body: ${r.body}`);
  }

  // Clear and go to library
  classPlansRequests.length = 0;
  await page.goto(`${BASE}/library`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  console.log("\n=== class_plans requests during LIBRARY load ===");
  for (const r of classPlansRequests) {
    console.log(`  ${r.method} ${r.status} ${r.url}`);
    console.log(`    body: ${r.body}`);
  }

  if (classPlansRequests.length === 0) {
    console.log("  ⚠️ NO requests to class_plans table during library load!");
    console.log("  This means the server component query ran server-side (not visible to browser)");
    console.log("  or the query errored silently");
  }

  // Check page
  const hasPlans = await page.getByText("My Class Plans").isVisible({ timeout: 2000 }).catch(() => false);
  console.log("\nMy Class Plans visible:", hasPlans);
  
  const hasDebugPlan = await page.getByText("Debug Plan Test").isVisible({ timeout: 2000 }).catch(() => false);
  console.log("Debug Plan Test visible:", hasDebugPlan);

  await page.screenshot({ path: "test-results/library-debug.png", fullPage: true });
});
