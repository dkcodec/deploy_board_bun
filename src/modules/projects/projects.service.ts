import { Project, ProjectList } from '../../models/project.model'
import { query, execute } from '../../infra/db'
import { NotFoundError, ForbiddenError } from '../../utils/errors'
import { ORDER_MAP } from '../../types/project.types'

export const projectsService = {
  async create(
    userId: string,
    data: { name: string; type: Project['type']; config?: unknown }
  ): Promise<Project> {
    const projects = await query<Project>(
      `
      INSERT INTO projects (user_id, name, type, config)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [userId, data.name, data.type, data.config ?? null]
    )

    return projects[0]
  },

  async list(
    userId: string,
    page: number = 1,
    limit: number = 20,
    sort: keyof typeof ORDER_MAP = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<ProjectList> {
    const offset = (page - 1) * limit
    const orderBy = ORDER_MAP[sort]
    const fetchLimit = limit + 1

    const [{ count }] = await query<{ count: string }>(
      `
      SELECT COUNT(*) FROM projects
      WHERE user_id = $1
      `,
      [userId]
    )

    const total = parseInt(count, 10)
    const totalPages = Math.ceil(total / limit)

    const projects = await query<Project>(
      `
      SELECT * FROM projects
      WHERE user_id = $1
      ORDER BY ${orderBy} ${order}
      LIMIT $2 OFFSET $3
      `,
      [userId, fetchLimit, offset]
    )

    if (projects.length === 0)
      return {
        results: [],
        page,
        limit,
        total,
        totalPages,
        hasMore: false,
      }

    const hasMore = projects.length > limit
    const results = hasMore ? projects.slice(0, limit) : projects

    return {
      results,
      page,
      total,
      totalPages,
      limit,
      hasMore,
    }
  },

  async getById(userId: string, projectId: string): Promise<Project> {
    const projects = await query<Project>(
      `
      SELECT * FROM projects
      WHERE id = $1 AND user_id = $2
      `,
      [projectId, userId]
    )

    const project = projects[0]
    if (!project) throw new NotFoundError('Project not found')

    if (project.user_id !== userId) {
      throw new ForbiddenError('Access denied')
    }

    return project
  },

  async delete(userId: string, projectId: string): Promise<void> {
    const result = await execute(
      `
      DELETE FROM projects
      WHERE user_id = $1 AND id = $2
      `,
      [userId, projectId]
    )
    if (result === 0) throw new NotFoundError('Project not found')
  },
}
