/**
 * AUTO-CP-004 — Login con contraseña incorrecta
 * Caso manual: CP-004
 * Aserción del mensaje actual del sitio (puede ser inglés: "Invalid login credentials").
 * Reutiliza: gotoApp, openLoginTab, testData.passIncorrecta
 */
import { test, expect } from "@playwright/test";
import { evidenceScreenshot, gotoApp, openLoginTab } from "../src/helpers";
import { testData } from "../src/test-data";

test.describe("AUTO-CP-004 — Login contraseña incorrecta @CP-004", () => {
  test("niega el acceso y muestra mensaje de credenciales inválidas", async ({ page }, testInfo) => {
    await gotoApp(page);
    await openLoginTab(page);
    await page.locator("#loginEmail").fill(testData.emailValido);
    await page.locator("#loginPassword").fill(testData.passIncorrecta);
    await page.locator("#btnLogin").click();

    const msg = page.locator("#authMsg");
    await expect(msg).toBeVisible({ timeout: 20_000 });
    await expect(msg).toHaveText(/Invalid login credentials|Correo o contraseña incorrectos/i);
    await expect(page.locator("#authGate")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ingresar a Despénsalo" })).toBeVisible();

    const runId = process.env.RUN_ID || "1";
    await evidenceScreenshot(
      page,
      `AUTO-CP-004-ok-${testInfo.project.name}-r${runId}.png`
    );
  });
});
