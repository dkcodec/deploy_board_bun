import { execute, query } from '../../infra/db'
import { Environment } from '../../models/enviroment.model'

export const environmentsRepository = {
  async create(
    projectId: string,
    name: string,
    slug: string
  ): Promise<Environment> {
    const res = await query<Environment>(
      `
            INSERT INTO environments (project_id, name, slug)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
      [projectId, name, slug]
    )
    return res[0]
  },

  async listByProject(projectId: string): Promise<Environment[]> {
    const res = await query<Environment>(
      `
      SELECT * FROM environments
      WHERE project_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      `,
      [projectId]
    )
    return res
  },

  async findById(id: string): Promise<Environment | null> {
    const res = await query<Environment>(
      `
        SELECT * FROM environments
        WHERE id = $1 AND deleted_at IS NULL
        LIMIT 1
        `,
      [id]
    )
    return res[0] ?? null
  },

  async softDeleteById(id: string): Promise<number> {
    return await execute(
      `
      UPDATE environments
      SET deleted_at = now()
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [id]
    )
  },

  async existsActiveByProjectSlug(
    projectId: string,
    slug: string
  ): Promise<boolean> {
    const res = await query<{ exists: boolean }>(
      `
      SELECT EXISTS(
        SELECT 1 FROM environments
        WHERE project_id = $1 AND slug = $2 AND deleted_at IS NULL
      ) as exists
      `,
      [projectId, slug]
    )
    return Boolean(res[0]?.exists)
  },
}
