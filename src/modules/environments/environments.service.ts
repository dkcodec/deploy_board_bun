import { Environment } from '../../models/enviroment.model'
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../utils/errors'
import { projectsRepository } from '../projects/projects.repository'
import { environmentsRepository } from './environments.repository'
import { normalizeSlug } from '../../utils/helpers'

export const environmentsService = {
  async create(
    userId: string,
    projectId: string,
    dto: { name: string; slug: string }
  ): Promise<Environment> {
    const isOwned = await projectsRepository.isOwnedByUser(projectId, userId)
    if (!isOwned) throw new ForbiddenError('Environment create access denied')

    const normalizedSlug = normalizeSlug(dto.slug)

    const isExists = await environmentsRepository.existsActiveByProjectSlug(
      projectId,
      normalizedSlug
    )

    if (isExists)
      throw new ConflictError('Environment with this slug already exists')

    return await environmentsRepository.create(
      projectId,
      dto.name.trim(),
      normalizedSlug
    )
  },

  async list(userId: string, projectId: string): Promise<Environment[]> {
    const isOwned = await projectsRepository.isOwnedByUser(projectId, userId)
    if (!isOwned) throw new ForbiddenError('Environment list access denied')

    return await environmentsRepository.listByProject(projectId)
  },

  async delete(userId: string, envId: string): Promise<void> {
    const env = await environmentsRepository.findById(envId)
    if (!env || env.deleted_at) throw new NotFoundError('Environment not found')

    const isOwned = await projectsRepository.isOwnedByUser(
      env.project_id,
      userId
    )
    if (!isOwned) throw new ForbiddenError('Environment delete access denied')
  },
}
