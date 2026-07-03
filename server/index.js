import { loadEnvFile } from "../scripts/load-env.mjs";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchWeddingData, publishWedding } from "./db.js";

loadEnvFile();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const port = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/wedding", async (_req, res) => {
  try {
    const data = await fetchWeddingData();
    res.json(data);
  } catch (err) {
    console.error("GET /api/wedding failed:", err);
    res.status(500).json({ error: err.message || "Failed to load wedding data" });
  }
});

app.post("/api/wedding/publish", async (req, res) => {
  try {
    const { password, coupleName, weddingDate, guests } = req.body || {};
    if (!Array.isArray(guests)) {
      return res.status(400).json({ error: "guests must be an array" });
    }
    await publishWedding({ password, coupleName, weddingDate, guests });
    res.json({ ok: true });
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error("POST /api/wedding/publish failed:", err);
    res.status(status).json({ error: err.message || "Failed to publish guest list" });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(distDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
