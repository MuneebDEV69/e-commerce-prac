-- Landing Page CMS migration — switch to a single JSON `sections` column.
-- Run this in Supabase → SQL Editor if `npm run db:push` can't reach port 5432.
-- (The runtime pooler on 6543 is unaffected; this is the only pending change.)

ALTER TABLE landing_page_content
  DROP COLUMN IF EXISTS announcement,
  DROP COLUMN IF EXISTS hero_images,
  DROP COLUMN IF EXISTS reels;

ALTER TABLE landing_page_content
  ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '[]'::jsonb;

-- If the table doesn't exist yet, create it instead:
-- CREATE TABLE landing_page_content (
--   id text PRIMARY KEY DEFAULT 'singleton',
--   sections jsonb NOT NULL DEFAULT '[]'::jsonb,
--   updated_at timestamptz NOT NULL DEFAULT now()
-- );
