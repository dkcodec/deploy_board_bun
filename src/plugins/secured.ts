import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { bearer } from '@elysiajs/bearer'
import { UnauthorizedError } from '../utils/errors'
import { env } from '../env'

// Плагин для защиты роутов - требует валидный JWT токен
export const secured = new Elysia({ name: 'secured' })
  .use(bearer()) // Подключаем плагин для извлечения bearer токена из заголовков
  .use(
    jwt({
      name: 'jwt',
      secret: env.JWT_SECRET,
      exp: '15m',
    })
  )
  .derive(
    { as: 'scoped' }, // Применяем derive к родительскому экземпляру (роутам, использующим плагин)
    async ({ bearer, jwt }) => {
      if (!bearer) {
        throw new UnauthorizedError('Unauthorized')
      }

      const payload = await jwt.verify(bearer)
      if (!payload) {
        throw new UnauthorizedError('Unauthorized')
      }

      const userId = payload.sub as string
      return { userId }
    }
  )
