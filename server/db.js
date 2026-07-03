import { neon } from "@neondatabase/serverless";

let sql;

export function getDb() {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    sql = neon(url);
  }
  return sql;
}

export async function fetchWeddingData() {
  const db = getDb();
  const [settingsRows, guestRows] = await Promise.all([
    db`SELECT couple_name, wedding_date FROM wedding_settings WHERE id = 1`,
    db`SELECT data FROM guests ORDER BY created_at`,
  ]);

  const settings = settingsRows[0] || {};
  return {
    coupleName: settings.couple_name || "",
    weddingDate: settings.wedding_date || "",
    guests: guestRows.map((row) => row.data),
  };
}

export async function publishWedding({ password, coupleName, weddingDate, guests }) {
  const db = getDb();
  const settingsRows = await db`SELECT admin_password FROM wedding_settings WHERE id = 1`;
  const stored = settingsRows[0]?.admin_password;

  if (!stored || password !== stored) {
    const err = new Error("Invalid admin password");
    err.status = 401;
    throw err;
  }

  await db`
    UPDATE wedding_settings
    SET couple_name = ${coupleName}, wedding_date = ${weddingDate}, updated_at = now()
    WHERE id = 1
  `;

  await db`DELETE FROM guests WHERE id IS NOT NULL`;

  for (const guest of guests) {
    await db`INSERT INTO guests (data) VALUES (${guest})`;
  }
}
