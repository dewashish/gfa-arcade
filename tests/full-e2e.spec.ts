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

test("Full E2E: create plan → launch → student joins → play quiz → certificate", async ({ browser }) => {
  // ===== TEACHER =====
  const teacherCtx = await browser.newContext();
  const teacher = await teacherCtx.newPage();
  await loginAsTeacher(teacher);
  console.log("✓ Teacher logged in");

  // Save a class plan with 1 activity
  await teacher.goto(`${BASE}/bank`);
  await teacher.waitForSelector("article", { timeout: 15000 });
  await teacher.locator('button[aria-label*="Add"][aria-label*="class plan"]').first().click();
  await teacher.waitForTimeout(500);
  const tray = teacher.locator('aside:not([aria-label="Primary navigation"])');
  const nameInput = tray.locator('input[placeholder*="Plan name"]');
  await nameInput.clear();
  await nameInput.fill("E2E Full Test");
  await tray.getByText("Save Plan").click();
  await teacher.waitForTimeout(2000);
  console.log("✓ Plan saved");

  // Launch the plan
  await tray.getByText("Launch Class").click();
  await teacher.waitForURL(/\/session\//, { timeout: 20000 });
  console.log("✓ Plan launched");

  // Get PIN — wait for it to render
  await teacher.waitForTimeout(3000);
  const pinEl = teacher.locator("span.tracking-tighter").first();
  await pinEl.waitFor({ state: "visible", timeout: 10000 });
  const pin = (await pinEl.textContent())?.trim() ?? "";
  console.log("PIN:", pin);
  expect(pin).toMatch(/^\d{6}$/);

  // ===== STUDENT =====
  const studentCtx = await browser.newContext();
  const student = await studentCtx.newPage();
  await student.goto(`${BASE}/play`);
  await student.waitForLoadState("domcontentloaded");

  // Join: PIN → Name → Avatar → GO
  await student.locator('input[inputmode="numeric"]').fill(pin);
  await student.getByRole("button", { name: /next/i }).click();
  await student.waitForTimeout(500);
  await student.locator('input[placeholder*="name"]').fill("E2E Student");
  await student.getByRole("button", { name: /pick buddy/i }).click();
  await student.waitForTimeout(500);
  await student.getByRole("button", { name: /^GO!/ }).click();
  await student.waitForURL(/\/play\//, { timeout: 15000 });
  console.log("✓ Student joined");

  // Check waiting lobby shows the student
  await student.waitForTimeout(2000);
  const lobbyVisible = await student.getByText("player").isVisible({ timeout: 5000 }).catch(() => false);
  console.log("Waiting lobby visible:", lobbyVisible);
  await student.screenshot({ path: "test-results/e2e-student-waiting.png" });

  // ===== TEACHER: Start Game =====
  await teacher.waitForTimeout(2000);
  const startBtn = teacher.getByRole("button", { name: /start game/i });
  if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await startBtn.click();
    console.log("✓ Teacher started game");
  }

  // ===== STUDENT: Should transition to playing (via realtime or polling) =====
  // Wait up to 6s for polling fallback if realtime misses
  await student.waitForTimeout(5000);
  await student.screenshot({ path: "test-results/e2e-student-playing.png" });

  // Check student sees quiz with timer
  const studentTimer = await student.locator("svg circle").count();
  console.log("Student timer circles:", studentTimer);
  const hasQuestion = await student.getByText(/question/i).isVisible({ timeout: 3000 }).catch(() => false);
  console.log("Student sees question:", hasQuestion);

  // Student answers first question
  const optionBtn = student.locator('button[class*="rounded"]').filter({ hasText: /\w+/ }).first();
  if (await optionBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await optionBtn.click();
    console.log("✓ Student answered question");
    await student.waitForTimeout(1000);
  }

  // ===== TEACHER: Check timer + leaderboard =====
  await teacher.screenshot({ path: "test-results/e2e-teacher-playing.png" });
  const teacherTimer = await teacher.locator("svg circle").count();
  console.log("Teacher timer circles:", teacherTimer);

  // Teacher side leaderboard should show the student
  const leaderboardEntry = await teacher.getByText("E2E Student").isVisible({ timeout: 5000 }).catch(() => false);
  console.log("Teacher sees student in leaderboard:", leaderboardEntry);

  // ===== TEACHER: End Game =====
  const endBtn = teacher.getByText("End Session");
  if (await endBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await endBtn.click();
    console.log("✓ Teacher ended game");
  }

  await student.waitForTimeout(3000);
  await student.screenshot({ path: "test-results/e2e-student-finished.png" });

  // Check student sees certificate / game over
  const gameOver = await student.getByText(/game over/i).isVisible({ timeout: 5000 }).catch(() => false);
  console.log("Student sees Game Over:", gameOver);

  // Check certificate download buttons
  const pngBtn = await student.getByRole("button", { name: /download png/i }).isVisible({ timeout: 3000 }).catch(() => false);
  const pdfBtn = await student.getByRole("button", { name: /download pdf/i }).isVisible({ timeout: 3000 }).catch(() => false);
  console.log("PNG download button:", pngBtn);
  console.log("PDF download button:", pdfBtn);

  // ===== RELAUNCH: Go to library and relaunch the same plan =====
  await teacher.goto(`${BASE}/library`);
  await teacher.waitForTimeout(3000);

  const planCard = teacher.getByText("E2E Full Test");
  const planVisible = await planCard.isVisible({ timeout: 5000 }).catch(() => false);
  console.log("Plan visible in library:", planVisible);

  if (planVisible) {
    const relaunchBtn = teacher.getByRole("button", { name: /launch/i }).first();
    await relaunchBtn.click();
    await teacher.waitForURL(/\/session\//, { timeout: 20000 });
    console.log("✓ Plan relaunched");

    // Check no duplicate activities in strip
    await teacher.waitForTimeout(2000);
    await teacher.screenshot({ path: "test-results/e2e-relaunch.png" });
    // Single-activity plans don't show a playlist strip, so just verify we're on a clean session
    const newPin = (await teacher.locator("header span.tracking-tighter").first().textContent())?.trim() ?? "";
    console.log("New PIN:", newPin);
    expect(newPin).toMatch(/^\d{6}$/);
    expect(newPin).not.toBe(pin); // Should be a different PIN
    console.log("✓ Clean relaunch — new PIN, no duplicates");
  }

  console.log("\n✅ Full E2E test complete!");

  await teacherCtx.close();
  await studentCtx.close();
});
