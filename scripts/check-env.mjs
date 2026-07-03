import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveSiteUrl } from "./resolve-site-url.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(readFileSync(resolve(root, "env.schema.json"), "utf8"));
const envPath = resolve(root, process.argv.includes("--example") ? ".env.example" : ".env");

function parseEnvFile(content) {
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function isPlaceholder(value) {
  return /your[-_]?(project|app|key)|example\.com|xxx/i.test(value);
}

function loadVars() {
  const vars = {};

  if (existsSync(envPath)) {
    Object.assign(vars, parseEnvFile(readFileSync(envPath, "utf8")));
  }

  for (const key of Object.keys(schema.properties)) {
    const fromProcess = process.env[key]?.trim();
    if (fromProcess) vars[key] = fromProcess;
  }

  if (!vars.VITE_SITE_URL?.trim() && resolveSiteUrl()) {
    vars.VITE_SITE_URL = resolveSiteUrl();
  }

  return vars;
}

const checkingExample = process.argv.includes("--example");
if (!existsSync(envPath)) {
  if (checkingExample) {
    console.error(`Missing ${envPath.split("/").pop()}.`);
    process.exit(1);
  }

  const hasRequiredInProcess = schema.required.every((key) => process.env[key]?.trim());
  if (!hasRequiredInProcess) {
    console.error("Missing .env and required variables are not set in the environment.");
    console.error(`Required: ${schema.required.join(", ")}`);
    if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) {
      console.error("");
      console.error("Railway: open your service → Variables and add:");
      console.error("  DATABASE_URL=<your Neon connection string>");
      console.error("  VITE_SITE_URL=https://eddieoncloud26.up.railway.app");
      console.error("Then trigger a new deploy.");
    }
    process.exit(1);
  }
}

const vars = loadVars();
const errors = [];
const warnings = [];

for (const key of schema.required) {
  if (!vars[key]?.trim()) {
    errors.push(`Missing required variable: ${key}`);
  } else if (isPlaceholder(vars[key])) {
    warnings.push(`${key} still looks like a placeholder`);
  }
}

for (const [key, def] of Object.entries(schema.properties)) {
  const value = vars[key]?.trim();
  if (!value) continue;
  if (def.pattern && !new RegExp(def.pattern).test(value)) {
    errors.push(`${key} does not match expected format (${def.pattern})`);
  }
}

const recommended = Object.entries(schema.properties)
  .filter(([, def]) => def.recommendedFor?.includes("production"))
  .map(([key]) => key);

for (const key of recommended) {
  if (!vars[key]?.trim()) {
    warnings.push(`Recommended for production: ${key} (needed for link previews)`);
  }
}

const allowed = new Set(Object.keys(schema.properties));
for (const key of Object.keys(vars)) {
  if (!allowed.has(key)) {
    warnings.push(`Unknown variable (not in env.schema.json): ${key}`);
  }
}

if (warnings.length) {
  console.warn("Warnings:");
  for (const warning of warnings) console.warn(`  - ${warning}`);
}

if (errors.length) {
  console.error("Errors:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`OK: env check passed (${checkingExample ? ".env.example" : existsSync(envPath) ? ".env" : "process.env"})`);
