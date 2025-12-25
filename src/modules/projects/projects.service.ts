import { Project, ProjectList } from '../../models/project.model'
import { NotFoundError, ForbiddenError } from '../../utils/errors'
import { ORDER_MAP } from '../../types/project.types'
import { projectsRepository } from './projects.repository'

// Сервис проектов - содержит бизнес-логику
export const projectsService = {
  // Создание нового проекта
  async create(
    userId: string,
    data: { name: string; type: Project['type']; config?: unknown }
  ): Promise<Project> {
    return await projectsRepository.create(
      userId,
      data.name,
      data.type,
      data.config
    )
  },

  // Получение списка проектов с пагинацией
  async list({
    userId,
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
  }: {
    userId: string
    page: number
    limit: number
    sort: keyof typeof ORDER_MAP
    order: 'asc' | 'desc'
  }): Promise<ProjectList> {
    const offset = (page - 1) * limit
    const orderBy = ORDER_MAP[sort]
    const fetchLimit = limit + 1

    // Получаем общее количество и список проектов
    const [total, projects] = await Promise.all([
      projectsRepository.countByUserId(userId),
      projectsRepository.findByUserId(
        userId,
        fetchLimit,
        offset,
        orderBy,
        order
      ),
    ])

    const totalPages = Math.ceil(total / limit)

    if (projects.length === 0) {
      return {
        results: [],
        page,
        limit,
        total,
        totalPages,
        hasMore: false,
      }
    }

    // Проверяем, есть ли еще страницы
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

  // Получение проекта по ID
  async getById(userId: string, projectId: string): Promise<Project> {
    const project = await projectsRepository.findByIdAndUserId(
      projectId,
      userId
    )

    if (!project) throw new NotFoundError('Project not found')

    // Дополнительная проверка доступа (хотя уже проверено в запросе)
    if (project.user_id !== userId) {
      throw new ForbiddenError('Access denied')
    }

    return project
  },

  // Удаление проекта
  async delete(userId: string, projectId: string): Promise<void> {
    const result = await projectsRepository.deleteByIdAndUserId(
      projectId,
      userId
    )
    if (result === 0) throw new NotFoundError('Project not found')
  },
}
