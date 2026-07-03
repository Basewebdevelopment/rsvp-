import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ENV_DEFAULTS, sharePreviewCopy } from "./env.defaults.js";
import { resolveSiteUrl } from "./scripts/resolve-site-url.mjs";

function siteMetaPlugin() {
  const siteUrl = resolveSiteUrl();
  const coupleNames = process.env.VITE_COUPLE_NAMES || ENV_DEFAULTS.VITE_COUPLE_NAMES;
  const weddingDate = process.env.VITE_WEDDING_DATE || ENV_DEFAULTS.VITE_WEDDING_DATE;
  const { title, description } = sharePreviewCopy(coupleNames, weddingDate);
  const imagePath = "/images/og-share.png";
  const imageUrl = siteUrl ? `${siteUrl}${imagePath}` : imagePath;
  const canonical = siteUrl ? `<link rel="canonical" href="${siteUrl}/" />` : "";

  if (!siteUrl) {
    console.warn(
      "Warning: VITE_SITE_URL (or RAILWAY_PUBLIC_DOMAIN) is not set — link preview image URLs will be relative."
    );
  }

  return {
    name: "site-meta",
    transformIndexHtml(html) {
      return html
        .replace(/__SITE_URL__/g, siteUrl)
        .replace(/__OG_TITLE__/g, title)
        .replace(/__OG_DESCRIPTION__/g, description)
        .replace(/__OG_IMAGE__/g, imageUrl)
        .replace("__CANONICAL__", canonical);
    },
  };
}

export default defineConfig({
  plugins: [react(), siteMetaPlugin()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
