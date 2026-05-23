import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase env vars. Copy .env.example to .env and add your project credentials."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchWeddingData() {
  const [settingsResult, guestsResult] = await Promise.all([
    supabase.from("wedding_settings").select("couple_name, wedding_date").eq("id", 1).single(),
    supabase.from("guests").select("data").order("created_at"),
  ]);

  if (settingsResult.error) throw settingsResult.error;
  if (guestsResult.error) throw guestsResult.error;

  return {
    coupleName: settingsResult.data?.couple_name || "",
    weddingDate: settingsResult.data?.wedding_date || "",
    guests: (guestsResult.data || []).map((row) => row.data),
  };
}

export async function publishWedding({ password, coupleName, weddingDate, guests }) {
  const { error } = await supabase.rpc("publish_wedding", {
    p_password: password,
    p_couple_name: coupleName,
    p_wedding_date: weddingDate,
    p_guests: guests,
  });

  if (error) throw error;
}
