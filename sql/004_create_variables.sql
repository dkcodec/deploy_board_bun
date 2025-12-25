
CREATE TABLE IF NOT EXISTS variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id UUID NOT NULL
    REFERENCES environments(id) ON DELETE CASCADE,

  key TEXT NOT NULL,
  value TEXT NOT NULL,
  is_secret BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ключ уникален в рамках environment (среди не удалённых)
CREATE UNIQUE INDEX IF NOT EXISTS variables_env_key_unique
ON variables(environment_id, key)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS variables_env_idx
ON variables(environment_id)
WHERE deleted_at IS NULL;
