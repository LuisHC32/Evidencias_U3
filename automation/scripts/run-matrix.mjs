import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = path.join(__dirname, "..");
const evid = path.join(cwd, "..", "evidencias", "fase 4");
const playwrightCli = path.join(cwd, "node_modules", "@playwright", "test", "cli.js");

const PROJECTS = ["chromium-desktop", "firefox-desktop"];
const RUNS = 3;

function parseJsonReport(file) {
  if (!fs.existsSync(file)) return { ok: false, tests: [] };
  const rawFull = fs.readFileSync(file, "utf8");
  const start = rawFull.indexOf("{");
  const end = rawFull.lastIndexOf("}");
  const raw = start >= 0 && end > start ? rawFull.slice(start, end + 1) : rawFull;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, tests: [] };
  }
  const tests = [];
  const walk = (suite) => {
    for (const spec of suite.specs || []) {
      for (const t of spec.tests || []) {
        const result = (t.results && t.results[0]) || {};
        tests.push({
          title: spec.title,
          file: suite.file || spec.file || "",
          status: result.status || t.status || "unknown",
        });
      }
    }
    for (const child of suite.suites || []) walk(child);
  };
  for (const s of data.suites || []) walk(s);
  const unexpected = data.stats?.unexpected ?? tests.filter((t) => t.status !== "passed" && t.status !== "skipped").length;
  return { ok: unexpected === 0 && tests.length > 0, tests, stats: data.stats || {} };
}

function runOnce(project, run) {
  const jsonFile = path.join(evid, `result-${project}-r${run}.json`);
  const reportDir = path.join(cwd, "playwright-report");
  const r = spawnSync(
    process.execPath,
    [
      playwrightCli,
      "test",
      `--project=${project}`,
      `--reporter=json`,
    ],
    {
      cwd,
      env: {
        ...process.env,
        RUN_ID: String(run),
        NODE_NO_WARNINGS: "1",
        FORCE_COLOR: "0",
      },
      encoding: "utf8",
      timeout: 420_000,
    }
  );
  fs.writeFileSync(jsonFile, r.stdout || "null");
  const parsed = parseJsonReport(jsonFile);
  return {
    project,
    run,
    exitCode: r.status,
    ok: r.status === 0 && parsed.ok,
    tests: parsed.tests,
    stderrTail: (r.stderr || "").slice(-800),
  };
}

fs.mkdirSync(evid, { recursive: true });
const rows = [];
for (const project of PROJECTS) {
  for (let run = 1; run <= RUNS; run++) {
    console.log(`\n=== ${project} · corrida ${run}/${RUNS} ===\n`);
    rows.push(runOnce(project, run));
  }
}

fs.writeFileSync(path.join(evid, "matrix-raw.json"), JSON.stringify(rows, null, 2));
console.log("\nMatriz cruda guardada en evidencias/fase 4/matrix-raw.json");
const total = rows.length * (rows[0]?.tests?.length || 4);
const passed = rows.reduce(
  (n, row) => n + (row.tests || []).filter((t) => t.status === "passed").length,
  0
);
console.log(`Tests individuales OK: ${passed}`);
console.log(`Corridas de suite OK: ${rows.filter((r) => r.ok).length}/${rows.length}`);
