/**
 * AUTO-CP-003 — Registro con contraseñas que no coinciden (extra)
 * Caso manual: CP-003
 * No crea cuenta. Reutiliza gotoApp / openRegisterTab / testData.
 */
import { test, expect } from "@playwright/test";
import { evidenceScreenshot, gotoApp, openRegisterTab } from "../src/helpers";
import { testData } from "../src/test-data";

test.describe("AUTO-CP-003 — Contraseñas no coinciden @CP-003", () => {
  test("bloquea el alta y muestra mensaje en español", async ({ page }, testInfo) => {
    await gotoApp(page);
    await openRegisterTab(page);
    await page.locator("#registerEmail").fill(testData.emailValido);
    await page.locator("#registerPassword").fill(testData.passValida);
    await page.locator("#registerPassword2").fill(testData.passIncorrecta);
    await page.locator("#btnRegister").click();

    await expect(page.locator("#authMsg")).toBeVisible();
    await expect(page.locator("#authMsg")).toHaveText("Las contraseñas no coinciden.");
    await expect(page.locator("#authGate")).toBeVisible();
    await expect(page.locator("#registerForm")).toBeVisible();

    const runId = process.env.RUN_ID || "1";
    await evidenceScreenshot(
      page,
      `AUTO-CP-003-ok-${testInfo.project.name}-r${runId}.png`
    );
  });
});
