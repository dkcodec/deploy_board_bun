import { execute, query } from '../../infra/db'
import { Variable } from '../../models/variables.model'

export const variablesRepository = {
  async create(
    envId: string,
    key: string,
    value: string,
    isSecret: boolean
  ): Promise<Variable> {
    const res = await query<Variable>(
      `
      INSERT INTO variables 
      (environment_id, key, value, is_secret) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
      `,
      [envId, key, value, isSecret]
    )
    return res[0]
  },

  async listByEnvironment(envId: string): Promise<Variable[]> {
    const res = await query<Variable>(
      `
      SELECT * FROM variables
      WHERE environment_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
      `,
      [envId]
    )
    return res
  },

  async findById(id: string): Promise<Variable | null> {
    const res = await query<Variable>(
      `
      SELECT * FROM variables
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
      UPDATE variables
      SET deleted_at = now()
      WHERE id = $1 AND deleted_at IS NULL
      `,
      [id]
    )
  },

  async existsByEnvKey(envId: string, key: string): Promise<boolean> {
    const res = await query<{ exists: boolean }>(
      `
      SELECT EXISTS(
        SELECT 1 FROM variables
        WHERE environment_id = $1 
        AND key = $2 
        AND deleted_at IS NULL
      ) as exists
      `,
      [envId, key]
    )
    return Boolean(res[0]?.exists)
  },
}
