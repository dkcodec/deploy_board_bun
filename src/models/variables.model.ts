export interface Variable {
  id: string
  environment_id: string
  key: string
  value: string | null
  is_secret: boolean
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}
