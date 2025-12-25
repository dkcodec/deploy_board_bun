import { query, execute } from '../../infra/db'
import type { Project } from '../../models/project.model'

// Репозиторий для работы с проектами
export const projectsRepository = {
  // Создание нового проекта
  async create(
    userId: string,
    name: string,
    type: Project['type'],
    config: unknown
  ): Promise<Project> {
    const projects = await query<Project>(
      `
      INSERT INTO projects (user_id, name, type, config)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [userId, name, type, config ?? null]
    )
    return projects[0]
  },

  // Получение списка проектов пользователя с пагинацией (только не удаленные)
  async findByUserId(
    userId: string,
    limit: number,
    offset: number,
    orderBy: string,
    order: 'asc' | 'desc'
  ): Promise<Project[]> {
    const projects = await query<Project>(
      `
      SELECT * FROM projects
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY ${orderBy} ${order}
      LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    )
    return projects
  },

  // Подсчет общего количества проектов пользователя (только не удаленные)
  async countByUserId(userId: string): Promise<number> {
    const [{ count }] = await query<{ count: string }>(
      `
      SELECT COUNT(*) as count FROM projects
      WHERE user_id = $1 AND deleted_at IS NULL
      `,
      [userId]
    )
    return parseInt(count, 10)
  },

  // Получение проекта по ID и userId (только не удаленный)
  async findByIdAndUserId(
    projectId: string,
    userId: string
  ): Promise<Project | null> {
    const projects = await query<Project>(
      `
      SELECT * FROM projects
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      `,
      [projectId, userId]
    )
    return projects[0] || null
  },

  // Soft delete проекта по ID и userId (устанавливает deleted_at)
  async deleteByIdAndUserId(
    projectId: string,
    userId: string
  ): Promise<number> {
    return await execute(
      `
      UPDATE projects
      SET deleted_at = now()
      WHERE user_id = $1 AND id = $2 AND deleted_at IS NULL
      `,
      [userId, projectId]
    )
  },

  async isOwnedByUser(projectId: string, userId: string): Promise<boolean> {
    const res = await query<{ exists: boolean }>(
      `
      SELECT EXISTS(
        SELECT 1 FROM projects
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      ) as exists
      `,
      [projectId, userId]
    )
    return Boolean(res[0]?.exists)
  },
}
