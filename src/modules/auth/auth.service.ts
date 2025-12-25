import { hashPassword, comparePassword } from '../../infra/crypto'
import { generateRefreshToken } from '../../utils/token'
import { UnauthorizedError } from '../../utils/errors'
import { userRepository, refreshTokenRepository } from './auth.repository'

const REFRESH_TTL_DAYS = 7

// Сервис аутентификации - содержит бизнес-логику
export const authService = {
  // Регистрация нового пользователя
  async register(email: string, password: string) {
    const passwordHash = await hashPassword(password)
    return await userRepository.create(email, passwordHash)
  },

  // Вход пользователя
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email)

    if (!user) throw new UnauthorizedError('Invalid credentials')

    const ok = await comparePassword(password, user.password_hash)
    if (!ok) throw new UnauthorizedError('Invalid credentials')

    // Генерация refresh токена
    const refreshToken = generateRefreshToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS)

    await refreshTokenRepository.create(user.id, refreshToken, expiresAt)

    return { user, refreshToken }
  },

  // Обновление access токена через refresh токен
  async refresh(refreshToken: string) {
    const token = await refreshTokenRepository.findValidToken(refreshToken)

    if (!token) {
      throw new UnauthorizedError('Invalid refresh token')
    }

    return { userId: token.user_id }
  },

  // Выход пользователя
  async logout(userId: string): Promise<void> {
    await refreshTokenRepository.deleteByUserId(userId)
  },
}
