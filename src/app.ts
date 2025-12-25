import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authRoutes } from './modules/auth/auth.routes'
import { AppError } from './utils/errors'
import { projectsRoutes } from './modules/projects/projects.routes'
import { environmentsRoutes } from './modules/environments/environments.routes'
import { variablesRoutes } from './modules/variables/variables.routes'

export const app = new Elysia()
  .onError(({ error, set }) => {
    if (error instanceof AppError) {
      set.status = error.status
      return {
        message: error.message,
      }
    }

    set.status = 500
    return {
      message: 'Internal server error',
    }
  })
  .use(cors())
  .use(authRoutes)
  .use(projectsRoutes)
  .use(environmentsRoutes)
  .use(variablesRoutes)
  .get('/health', () => ({ ok: true }))
