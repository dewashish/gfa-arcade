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

test("Timer visible to both teacher and student during quiz", async ({ browser }) => {
  // ===== TEACHER: Create a session =====
  const teacherCtx = await browser.newContext();
  const teacher = await teacherCtx.newPage();
  await loginAsTeacher(teacher);
  console.log("✓ Teacher logged in");

  // Launch a quiz from bank
  await teacher.goto(`${BASE}/bank`);
  await teacher.waitForSelector("article", { timeout: 15000 });
  const useBtn = teacher.locator('button:has-text("Use in class")').first();
  await useBtn.click();
  await teacher.waitForURL(/\/session\//, { timeout: 20000 });
  console.log("✓ Session created");

  // Extract PIN from top bar
  await teacher.waitForTimeout(1500);
  const pinText = await teacher.locator("header span.tracking-tighter").first().textContent();
  const pin = pinText?.trim() ?? "";
  console.log("PIN:", pin);
  expect(pin).toMatch(/^\d{6}$/);

  // ===== STUDENT: Join via 3-step wizard =====
  const studentCtx = await browser.newContext();
  const student = await studentCtx.newPage();
  await student.goto(`${BASE}/play`);
  await student.waitForLoadState("domcontentloaded");

  // Step 1: Enter PIN
  const pinInput = student.locator('input[inputmode="numeric"]');
  await pinInput.waitFor({ state: "visible", timeout: 10000 });
  await pinInput.fill(pin);
  await student.getByRole("button", { name: /next/i }).click();
  await student.waitForTimeout(500);
  console.log("✓ PIN entered");

  // Step 2: Enter name
  const nameInput = student.locator('input[placeholder*="name"]');
  await nameInput.waitFor({ state: "visible", timeout: 5000 });
  await nameInput.fill("Timer Test");
  await student.getByRole("button", { name: /pick buddy/i }).click();
  await student.waitForTimeout(500);
  console.log("✓ Name entered");

  // Step 3: Pick avatar and GO
  await student.getByRole("button", { name: /^GO!/ }).click();
  await student.waitForURL(/\/play\//, { timeout: 15000 });
  console.log("✓ Student joined session");

  // ===== TEACHER: Start the game =====
  await teacher.waitForTimeout(2000);
  const startBtn = teacher.getByRole("button", { name: /start game/i });
  await expect(startBtn).toBeVisible({ timeout: 5000 });
  await startBtn.click();
  console.log("✓ Teacher started game");

  // Wait for game to render on both sides
  await teacher.waitForTimeout(3000);
  await student.waitForTimeout(3000);

  // ===== CHECK: Teacher timer =====
  await teacher.screenshot({ path: "test-results/timer-teacher.png" });
  const teacherCircles = await teacher.locator("svg circle").count();
  console.log("Teacher SVG circles:", teacherCircles);
  expect(teacherCircles).toBeGreaterThanOrEqual(2);

  // ===== CHECK: Student timer =====
  await student.screenshot({ path: "test-results/timer-student.png" });
  const studentCircles = await student.locator("svg circle").count();
  console.log("Student SVG circles:", studentCircles);
  expect(studentCircles).toBeGreaterThanOrEqual(2);

  console.log("\n✅ Both teacher and student see countdown timers!");

  await teacherCtx.close();
  await studentCtx.close();
});
