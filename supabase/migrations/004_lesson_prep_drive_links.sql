-- Google Drive cursusmateriaal koppelen aan lesvoorbereidingen

ALTER TABLE lesson_preparations
  ADD COLUMN IF NOT EXISTS drive_links JSONB NOT NULL DEFAULT '[]';

COMMENT ON COLUMN lesson_preparations.drive_links IS
  'Array van {label, url} objecten naar Google Drive / Docs / Sheets / Slides';
