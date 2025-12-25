import Elysia, { t } from 'elysia'
import { secured } from '../../plugins/secured'
import { environmentsService } from './environments.service'

export const environmentsRoutes = new Elysia()
  .use(secured)
  .group('/projects/:id/environments', (app) =>
    app
      .get(
        '/',
        async ({ userId, params }) => {
          return await environmentsService.list(userId, params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
        }
      )
      .post(
        '/',
        async ({ userId, params, body }) => {
          return await environmentsService.create(userId, params.id, body)
        },
        {
          body: t.Object({
            name: t.String({ minLength: 1, maxLength: 64 }),
            slug: t.String({
              minLength: 1,
              maxLength: 32,
              pattern: '^[a-z0-9-]+$',
            }),
          }),
        }
      )
  )
  .delete(
    '/environments/:envId',
    async ({ userId, params }) => {
      return await environmentsService.delete(userId, params.envId)
    },
    {
      params: t.Object({
        envId: t.String(),
      }),
    }
  )
