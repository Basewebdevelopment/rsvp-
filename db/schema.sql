-- Wedding seating app schema (Neon PostgreSQL)

CREATE TABLE IF NOT EXISTS wedding_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  couple_name text NOT NULL DEFAULT '',
  wedding_date text NOT NULL DEFAULT '',
  admin_password text NOT NULL DEFAULT 'couple2026',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO wedding_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
