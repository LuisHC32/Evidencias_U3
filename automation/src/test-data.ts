import fs from "fs";
import path from "path";

function loadDotEnv(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv(path.join(__dirname, "..", ".env"));

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Falta ${name}. Copia automation/.env.example a automation/.env y completa los datos de prueba.`
    );
  }
  return value;
}

/** Datos de prueba parametrizados (variables de entorno / .env). */
export const testData = {
  baseUrl: (process.env.BASE_URL || "https://despensalo.cl/").replace(/\/?$/, "/"),
  emailValido: required("EMAIL_VALIDO"),
  passValida: required("PASS_VALIDA"),
  passIncorrecta: process.env.PASS_INCORRECTA?.trim() || "ClaveErronea1!",
};
