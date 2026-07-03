/** Shared defaults for build-time and runtime env. Keep in sync with env.schema.json */
export const ENV_DEFAULTS = {
  VITE_COUPLE_NAMES: "Edmond & Claudia",
  VITE_WEDDING_DATE: "08 August 2026",
};

export const SITE_LABEL = "Seating Plan";

export function sharePreviewCopy(
  coupleNames = ENV_DEFAULTS.VITE_COUPLE_NAMES,
  weddingDate = ENV_DEFAULTS.VITE_WEDDING_DATE
) {
  return {
    title: `${coupleNames} · ${SITE_LABEL}`,
    description: `Navigate here to find the seat you'll be sitting at. ${coupleNames} · ${weddingDate}.`,
  };
}

export const REQUIRED_AT_RUNTIME = [];

export const REQUIRED_AT_BUILD = [];

export const REQUIRED_AT_SERVER = ["DATABASE_URL"];

export const RECOMMENDED_AT_BUILD = [
  "VITE_SITE_URL",
];
