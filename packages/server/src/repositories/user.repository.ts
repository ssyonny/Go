import { pool } from '../config/database';
import type { User } from '@baduk/shared';

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  nickname: string;
  rank_tier: string;
  rank_level: number;
  points: number;
  refresh_token: string | null;
  is_deleted: boolean;
  last_login_at: string | null;
  created_at: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    rankTier: row.rank_tier as User['rankTier'],
    rankLevel: row.rank_level,
    points: row.points,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  };
}

export const userRepository = {
  async findByUsername(username: string): Promise<(User & { passwordHash: string }) | null> {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_deleted = FALSE',
      [username]
    );
    if (rows.length === 0) return null;
    return { ...rowToUser(rows[0]), passwordHash: rows[0].password_hash };
  },

  async findByNickname(nickname: string): Promise<User | null> {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE nickname = $1 AND is_deleted = FALSE',
      [nickname]
    );
    if (rows.length === 0) return null;
    return rowToUser(rows[0]);
  },

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );
    if (rows.length === 0) return null;
    return rowToUser(rows[0]);
  },

  async create(username: string, passwordHash: string, nickname: string): Promise<User> {
    const { rows } = await pool.query(
      `INSERT INTO users (username, password_hash, nickname) VALUES ($1, $2, $3) RETURNING *`,
      [username, passwordHash, nickname]
    );
    return rowToUser(rows[0]);
  },

  async updateRefreshToken(userId: string, hashedToken: string | null): Promise<void> {
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [hashedToken, userId]
    );
  },

  async getRefreshToken(userId: string): Promise<string | null> {
    const { rows } = await pool.query(
      'SELECT refresh_token FROM users WHERE id = $1 AND is_deleted = FALSE',
      [userId]
    );
    return rows[0]?.refresh_token ?? null;
  },

  async updateLastLogin(userId: string): Promise<void> {
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [userId]
    );
  },
};
