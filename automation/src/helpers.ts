import { expect, type Page } from "@playwright/test";
import { testData } from "./test-data";

/** Abre la PWA y espera el gate de cuenta o la app ya autenticada. */
export async function gotoApp(page: Page): Promise<void> {
  await page.goto(testData.baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForFunction(() => {
    const gate = document.getElementById("authGate");
    if (!gate) return false;
    const waitingLogin = document.body.classList.contains("auth-locked") && !gate.classList.contains("hide");
    const inApp = !document.body.classList.contains("auth-locked");
    return waitingLogin || inApp;
  }, { timeout: 30_000 });
}

export async function openLoginTab(page: Page): Promise<void> {
  if (await page.locator("#authTabLogin").isVisible()) {
    await page.locator("#authTabLogin").click();
  }
}

export async function openRegisterTab(page: Page): Promise<void> {
  if (await page.locator("#authTabRegister").isVisible()) {
    await page.locator("#authTabRegister").click();
  }
}

/**
 * Inicio de sesión como usuario final.
 * Reutilizado por AUTO-CP-002 y AUTO-CP-009 (y cualquier spec que necesite sesión).
 */
export async function login(
  page: Page,
  email: string = testData.emailValido,
  password: string = testData.passValida
): Promise<void> {
  await gotoApp(page);
  if (await page.locator("#authGate").isHidden()) {
    return;
  }
  await openLoginTab(page);
  await page.locator("#loginEmail").fill(email);
  await page.locator("#loginPassword").fill(password);
  await page.locator("#btnLogin").click();
  await expect(page.locator("#authGate")).toBeHidden({ timeout: 25_000 });
}

export async function showTab(page: Page, sectionId: string): Promise<void> {
  await page.evaluate((id) => {
    const w = window as unknown as { showTab?: (tabId: string) => void };
    if (typeof w.showTab === "function") w.showTab(id);
  }, sectionId);
  await page.waitForTimeout(400);
}

export async function evidenceScreenshot(page: Page, fileName: string): Promise<void> {
  await page.screenshot({
    path: `../evidencias/fase 4/${fileName}`,
    fullPage: false,
  });
}
