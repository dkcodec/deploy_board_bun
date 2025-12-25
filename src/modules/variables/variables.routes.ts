import Elysia, { t } from 'elysia'
import { secured } from '../../plugins/secured'
import { variablesService } from './variables.service'

export const variablesRoutes = new Elysia()
  .use(secured)
  .group('/environments/:envId/variables', (app) =>
    app
      .get(
        '/',
        async ({ userId, params }) => {
          return await variablesService.list(userId, params.envId)
        },
        {
          params: t.Object({
            envId: t.String(),
          }),
        }
      )
      .post(
        '/',
        async ({ userId, params, body }) => {
          return await variablesService.create(userId, params.envId, body)
        },
        {
          params: t.Object({
            envId: t.String(),
          }),
          body: t.Object({
            key: t.String({ minLength: 1, maxLength: 64 }),
            value: t.String({ maxLength: 2048 }),
            isSecret: t.Boolean({ default: false }),
          }),
        }
      )
  )
  .delete(
    '/variables/:id',
    async ({ userId, params }) => {
      return await variablesService.delete(userId, params.id)
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
