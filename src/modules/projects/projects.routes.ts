import { Elysia, t } from 'elysia'
import { projectsService } from './projects.service'
import { secured } from '../../plugins/secured'

export const projectsRoutes = new Elysia({ prefix: '/projects' })
  .use(secured)
  .post(
    '/create',
    async ({ body, userId }) => {
      const res = await projectsService.create(userId, body)
      return res
    },
    {
      body: t.Object({
        name: t.String(),
        type: t.UnionEnum(['ssh', 'docker', 'do']),
        config: t.Optional(t.Unknown()),
      }),
    }
  )
  .get(
    '/list',
    async ({ userId, query }) => {
      const projects = await projectsService.list({
        userId,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        sort: query.sort ?? 'createdAt',
        order: query.order ?? 'desc',
      })
      return projects
    },
    {
      query: t.Object({
        page: t.Optional(t.Number({ default: 1 })),
        limit: t.Optional(t.Number({ default: 20 })),
        sort: t.Optional(t.UnionEnum(['createdAt', 'name', 'updatedAt'])),
        order: t.Optional(t.UnionEnum(['asc', 'desc'])),
      }),
    }
  )
  .get(
    '/:id',
    async ({ userId, params }) => {
      const project = await projectsService.getById(userId, params.id)
      return project
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .delete(
    '/:id',
    async ({ userId, params }) => {
      await projectsService.delete(userId, params.id)
      return { success: true }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
