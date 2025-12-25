import { Variable } from '../../models/variables.model'
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../utils/errors'
import { normalizeKey } from '../../utils/helpers'
import { environmentsRepository } from '../environments/environments.repository'
import { projectsRepository } from '../projects/projects.repository'
import { variablesRepository } from './variables.repository'

export const variablesService = {
  async create(
    userId: string,
    envId: string,
    dto: { key: string; value: string; isSecret: boolean }
  ) {
    const env = await environmentsRepository.findById(envId)
    if (!env || env.deleted_at) throw new NotFoundError('Environment not found')

    const isOwned = await projectsRepository.isOwnedByUser(
      env.project_id,
      userId
    )
    if (!isOwned) throw new ForbiddenError('Variable create access denied')

    const normalizedKey = normalizeKey(dto.key)

    const isExists = await variablesRepository.existsByEnvKey(
      envId,
      normalizedKey
    )
    if (isExists)
      throw new ConflictError('Variable with this key already exists')

    return await variablesRepository.create(
      envId,
      normalizedKey,
      dto.value,
      dto.isSecret
    )
  },

  async list(userId: string, envId: string): Promise<Variable[]> {
    const env = await environmentsRepository.findById(envId)
    if (!env || env.deleted_at) throw new NotFoundError('Environment not found')

    const isOwned = await projectsRepository.isOwnedByUser(
      env.project_id,
      userId
    )
    if (!isOwned) throw new ForbiddenError('Variable create access denied')

    const vars = await variablesRepository.listByEnvironment(envId)

    return vars.map((v) => ({
      ...v,
      value: v.is_secret ? null : v.value,
    }))
  },

  async delete(userId: string, varId: string): Promise<void> {
    const variable = await variablesRepository.findById(varId)
    if (!variable || variable.deleted_at)
      throw new NotFoundError('Variable not found')

    const env = await environmentsRepository.findById(variable.environment_id)
    if (!env || env.deleted_at) throw new NotFoundError('Environment not found')

    const isOwned = await projectsRepository.isOwnedByUser(
      env.project_id,
      userId
    )
    if (!isOwned) throw new ForbiddenError('Variable delete access denied')

    await variablesRepository.softDeleteById(varId)
  },
}
