export interface Project {
  id: string
  user_id: string
  name: string
  type: 'ssh' | 'docker' | 'do'
  config: unknown
  created_at: Date
}

export interface ProjectList {
  results: Project[]
  total: number
  totalPages: number
  page: number
  limit: number
  hasMore: boolean
}
