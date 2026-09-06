/**
 * AUTO-CP-002 — Login con credenciales válidas
 * Caso manual: CP-002 (Fase1_Preparacion_Disenio_Pruebas.md)
 * Reutiliza: gotoApp/login (helpers) + testData (EMAIL_VALIDO / PASS_VALIDA)
 */
import { test, expect } from "@playwright/test";
import { evidenceScreenshot, login, showTab } from "../src/helpers";
import { testData } from "../src/test-data";

test.describe("AUTO-CP-002 — Login válido @CP-002", () => {
  test("el usuario entra y ve su correo en Ajustes", async ({ page }, testInfo) => {
    await login(page, testData.emailValido, testData.passValida);

    await expect(page.locator("#authGate")).toBeHidden();
    await expect(page.getByRole("button", { name: "Inicio" }).first()).toBeVisible();

    await showTab(page, "settingsSection");
    await expect(page.locator("#accountEmail")).toContainText(testData.emailValido);

    const runId = process.env.RUN_ID || "1";
    await evidenceScreenshot(
      page,
      `AUTO-CP-002-ok-${testInfo.project.name}-r${runId}.png`
    );
  });
});
