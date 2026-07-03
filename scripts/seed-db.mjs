import { loadEnvFile } from "./load-env.mjs";
import { neon } from "@neondatabase/serverless";
import { buildGuestRows } from "./seed-guests.mjs";
import { ENV_DEFAULTS } from "../env.defaults.js";

loadEnvFile();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(url);
const guests = buildGuestRows();

await sql`
  UPDATE wedding_settings
  SET
    couple_name = ${process.env.SEED_COUPLE_NAME || ENV_DEFAULTS.VITE_COUPLE_NAMES},
    wedding_date = ${process.env.SEED_WEDDING_DATE || ENV_DEFAULTS.VITE_WEDDING_DATE},
    updated_at = now()
  WHERE id = 1
`;

await sql`DELETE FROM guests WHERE id IS NOT NULL`;

for (const guest of guests) {
  await sql`INSERT INTO guests (data) VALUES (${guest})`;
}

console.log(`Seeded ${guests.length} guests across 30 tables.`);
