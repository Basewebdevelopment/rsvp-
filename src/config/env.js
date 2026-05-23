import { ENV_DEFAULTS, REQUIRED_AT_RUNTIME } from "../../env.defaults.js";

function readEnv(name, fallback = "") {
  const value = import.meta.env[name];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export const env = {
  supabaseUrl: readEnv("VITE_SUPABASE_URL"),
  supabasePublishableKey: readEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
  siteUrl: readEnv("VITE_SITE_URL"),
  coupleNames: readEnv("VITE_COUPLE_NAMES", ENV_DEFAULTS.VITE_COUPLE_NAMES),
  weddingDate: readEnv("VITE_WEDDING_DATE", ENV_DEFAULTS.VITE_WEDDING_DATE),
};

export function assertRuntimeEnv() {
  const missing = REQUIRED_AT_RUNTIME.filter((key) => !readEnv(key));
  if (missing.length) {
    throw new Error(
      `Missing required env: ${missing.join(", ")}. See env.schema.json and .env.example.`
    );
  }
}

export function sharePreviewText(coupleName = env.coupleNames, weddingDate = env.weddingDate) {
  const names = coupleName || ENV_DEFAULTS.VITE_COUPLE_NAMES;
  const date = weddingDate || ENV_DEFAULTS.VITE_WEDDING_DATE;
  return {
    title: `${names} · Wedding Reception`,
    description: `You're invited to celebrate with us on ${date}. Find your seat at the reception.`,
  };
}
