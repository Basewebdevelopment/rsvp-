import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ENV_DEFAULTS, sharePreviewCopy } from "./env.defaults.js";

function siteMetaPlugin() {
  const siteUrl = (process.env.VITE_SITE_URL || "").replace(/\/$/, "");
  const coupleNames = process.env.VITE_COUPLE_NAMES || ENV_DEFAULTS.VITE_COUPLE_NAMES;
  const weddingDate = process.env.VITE_WEDDING_DATE || ENV_DEFAULTS.VITE_WEDDING_DATE;
  const { title, description } = sharePreviewCopy(coupleNames, weddingDate);
  const imagePath = "/images/og-share.png";
  const imageUrl = siteUrl ? `${siteUrl}${imagePath}` : imagePath;
  const canonical = siteUrl ? `<link rel="canonical" href="${siteUrl}/" />` : "";

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
});
