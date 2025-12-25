-- Добавление поля deleted_at для soft delete в таблицу projects
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Создание индекса для оптимизации запросов с фильтром deleted_at
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at) WHERE deleted_at IS NULL;

