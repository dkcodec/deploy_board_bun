import { execute, query } from "../../infra/db";
import { hashPassword, comparePassword } from "../../infra/crypto";
import { generateRefreshToken } from "../../utils/token";
import {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} from "../../utils/errors";

import type { User } from "../../models/user.model";
import type { RefreshToken } from "../../models/refresh-token.model";

const ACCESS_TTL_MINUTES = 15;
const REFRESH_TTL_DAYS = 7;

export const authService = {
  async register(email: string, password: string) {
    const passwordHash = await hashPassword(password);

    const users = await query<User>(
      `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING *
      `,
      [email, passwordHash],
    );

    return users[0];
  },

  async login(email: string, password: string) {
    const users = await query<User>(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    const user = users[0];

    if (!user) throw new UnauthorizedError("Invalid credentials");

    const ok = await comparePassword(password, user.password_hash);
    if (!ok) throw new UnauthorizedError("Invalid credentials");

    const refreshToken = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);

    await query(
      `
          INSERT INTO refresh_tokens (user_id, token, expires_at)
          VALUES ($1, $2, $3)
          `,
      [user.id, refreshToken, expiresAt],
    );

    return { user, refreshToken };
  },

  async refresh(refreshToken: string) {
    const tokens = await query<RefreshToken>(
      `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > now()`,
      [refreshToken],
    );

    const token = tokens[0];
    if (!token) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    return { userId: token.user_id };
  },
  async logout(refreshToken: string): Promise<void> {
    await execute(`DELETE FROM refresh_tokens WHERE token = $1`, [
      refreshToken,
    ]);
  },
};
