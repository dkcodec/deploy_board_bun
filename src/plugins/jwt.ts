import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { bearer } from '@elysiajs/bearer'
import { env } from '../env'

export const jwtPlugin = new Elysia()
  .use(bearer())
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET,
      exp: '15m',
    })
  )
  .derive(async ({ bearer, jwt }) => {
    if (!bearer) return {}

    const payload = await jwt.verify(bearer)
    if (!payload) return {}

    return {
      userId: payload.sub as string,
    }
  })
