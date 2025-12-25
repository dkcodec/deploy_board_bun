import { query, execute } from '../../infra/db'
import type { User } from '../../models/user.model'
import type { RefreshToken } from '../../models/refresh-token.model'

// Репозиторий для работы с пользователями
export const userRepository = {
  // Создание нового пользователя
  async create(email: string, passwordHash: string): Promise<User> {
    const users = await query<User>(
      `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING *
      `,
      [email, passwordHash]
    )
    return users[0]
  },

  // Поиск пользователя по email
  async findByEmail(email: string): Promise<User | null> {
    const users = await query<User>(`SELECT * FROM users WHERE email = $1`, [
      email,
    ])
    return users[0] || null
  },
}

// Репозиторий для работы с refresh токенами
export const refreshTokenRepository = {
  // Создание нового refresh токена
  async create(userId: string, token: string, expiresAt: Date): Promise<void> {
    await query(
      `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      `,
      [userId, token, expiresAt]
    )
  },

  // Поиск валидного refresh токена
  async findValidToken(token: string): Promise<RefreshToken | null> {
    const tokens = await query<RefreshToken>(
      `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > now()`,
      [token]
    )
    return tokens[0] || null
  },

  // Удаление refresh токена
  async deleteByToken(token: string): Promise<void> {
    await execute(`DELETE FROM refresh_tokens WHERE token = $1`, [token])
  },

  // Удаление всех токенов пользователя (для logout)
  async deleteByUserId(userId: string): Promise<void> {
    await execute(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId])
  },
}
