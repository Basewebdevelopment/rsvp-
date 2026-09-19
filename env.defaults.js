/** Shared defaults for build-time and runtime env. Keep in sync with env.schema.json */
export const ENV_DEFAULTS = {
  VITE_COUPLE_NAMES: "Steven & Priscilla",
  VITE_WEDDING_DATE: "19 September 2026",
  VITE_VENUE_NAME: "Castle Bromwich Hall",
  VITE_VENUE_ADDRESS: "Chester Road, Birmingham, B36 9DE",
  VITE_VENUE_MAPS_URL: "https://maps.google.com/?q=Castle+Bromwich+Hall+Hotel+B36+9DE",
  VITE_ARRIVAL_TIME: "11:45 am",
  VITE_CEREMONY_TIME: "12:00 pm",
};

export const SITE_LABEL = "Seating Plan";

export function sharePreviewCopy(
  coupleNames = ENV_DEFAULTS.VITE_COUPLE_NAMES,
  weddingDate = ENV_DEFAULTS.VITE_WEDDING_DATE
) {
  return {
    title: `${coupleNames} · ${SITE_LABEL}`,
    description: `${coupleNames} · ${weddingDate} · Castle Bromwich Hall, Chester Road, Birmingham B36 9DE`,
  };
}

export const REQUIRED_AT_RUNTIME = [];

export const REQUIRED_AT_BUILD = [];

export const REQUIRED_AT_SERVER = ["DATABASE_URL"];

export const RECOMMENDED_AT_BUILD = [
  "VITE_SITE_URL",
];
