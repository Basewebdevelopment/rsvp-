-- Wedding seating app schema

CREATE TABLE wedding_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  couple_name text NOT NULL DEFAULT '',
  wedding_date text NOT NULL DEFAULT '',
  admin_password text NOT NULL DEFAULT 'couple2026',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO wedding_settings (id) VALUES (1);

ALTER TABLE wedding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wedding settings"
  ON wedding_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read guests"
  ON guests FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION publish_wedding(
  p_password text,
  p_couple_name text,
  p_wedding_date text,
  p_guests jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_pw text;
BEGIN
  SELECT admin_password INTO stored_pw FROM wedding_settings WHERE id = 1;

  IF stored_pw IS NULL OR p_password <> stored_pw THEN
    RAISE EXCEPTION 'Invalid admin password';
  END IF;

  UPDATE wedding_settings
  SET
    couple_name = p_couple_name,
    wedding_date = p_wedding_date,
    updated_at = now()
  WHERE id = 1;

  DELETE FROM guests WHERE id IS NOT NULL;

  INSERT INTO guests (data)
  SELECT value
  FROM jsonb_array_elements(p_guests) AS value;
END;
$$;

REVOKE ALL ON FUNCTION publish_wedding(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION publish_wedding(text, text, text, jsonb) TO anon, authenticated;
