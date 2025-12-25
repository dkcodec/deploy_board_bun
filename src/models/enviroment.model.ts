export interface Environment {
  id: string
  project_id: string
  name: string
  slug: string
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}
