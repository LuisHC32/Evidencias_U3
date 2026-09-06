/**
 * AUTO-CP-009 — Código manual vacío → Procesar
 * Caso manual: CP-009
 * Reutiliza login() (helper compartido) porque el sitio exige sesión para ver el escáner.
 */
import { test, expect } from "@playwright/test";
import { evidenceScreenshot, login, showTab } from "../src/helpers";

test.describe("AUTO-CP-009 — Código manual vacío @CP-009", () => {
  test("Procesar sin código muestra validación y no altera el inventario", async ({ page }, testInfo) => {
    await login(page);
    await showTab(page, "homeSection");

    const productosAntes = (await page.locator("#kProducts").innerText()).trim();

    await page.locator("#manualCode").fill("");
    await page.locator("#btnManual").click();

    const toast = page.locator("#toast");
    await expect(toast).toBeVisible({ timeout: 8_000 });
    await expect(toast).toHaveText(/Ingresa un código válido/i);

    await expect(page.locator("#kProducts")).toHaveText(productosAntes);

    const runId = process.env.RUN_ID || "1";
    await evidenceScreenshot(
      page,
      `AUTO-CP-009-ok-${testInfo.project.name}-r${runId}.png`
    );
  });
});
