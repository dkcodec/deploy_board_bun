
CREATE TABLE IF NOT EXISTS environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- уникальность slug внутри проекта, но только среди НЕудалённых
CREATE UNIQUE INDEX IF NOT EXISTS environments_project_slug_unique
ON environments(project_id, slug)
WHERE deleted_at IS NULL;

-- для быстрых list по project
CREATE INDEX IF NOT EXISTS environments_project_id_idx
ON environments(project_id)
WHERE deleted_at IS NULL;
