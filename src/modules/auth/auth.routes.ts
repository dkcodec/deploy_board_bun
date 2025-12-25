import { Elysia, t } from 'elysia'
import { authService } from './auth.service'
import { jwtPlugin } from '../../plugins/jwt'

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwtPlugin)
  .post(
    '/register',
    async ({ body }) => {
      const user = await authService.register(body.email, body.password)
      return { id: user.id, email: user.email }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
      }),
    }
  )
  .post(
    '/login',
    async ({ body, jwt }) => {
      const { user, refreshToken } = await authService.login(
        body.email,
        body.password
      )
      const accessToken = await jwt.sign({ sub: user.id })

      return { accessToken, refreshToken }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    '/refresh',
    async ({ body, jwt }) => {
      const { userId } = await authService.refresh(body.refreshToken)
      const accessToken = await jwt.sign({ sub: userId })

      return { accessToken }
    },
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
    }
  )
  .post(
    '/logout',
    async ({ body }) => {
      await authService.logout(body.userId)
      return { message: 'Logged out successfully' }
    },
    {
      body: t.Object({
        userId: t.String({ format: 'uuid' }),
      }),
    }
  )
