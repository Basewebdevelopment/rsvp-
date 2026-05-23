/** Resolve public site URL for build-time meta tags. */
export function resolveSiteUrl(env = process.env) {
  const explicit = (env.VITE_SITE_URL || "").trim().replace(/\/$/, "");
  if (explicit) return explicit;

  const railwayDomain = (env.RAILWAY_PUBLIC_DOMAIN || "").trim().replace(/\/$/, "");
  if (!railwayDomain) return "";

  return railwayDomain.startsWith("http") ? railwayDomain.replace(/\/$/, "") : `https://${railwayDomain}`;
}
