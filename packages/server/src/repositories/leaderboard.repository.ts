import { pool } from '../config/database';

export const leaderboardRepository = {
  async getTopPlayers(limit: number = 50, offset: number = 0) {
    const { rows } = await pool.query(
      `SELECT id, nickname, rank_tier, rank_level, points,
              ROW_NUMBER() OVER (ORDER BY points DESC, created_at ASC) as rank
       FROM users
       WHERE is_deleted = FALSE
       ORDER BY points DESC, created_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  },

  async getTotalCount(): Promise<number> {
    const { rows } = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE is_deleted = FALSE'
    );
    return parseInt(rows[0].count, 10);
  },

  async getUserRank(userId: string): Promise<number | null> {
    const { rows } = await pool.query(
      `SELECT rank FROM (
         SELECT id, ROW_NUMBER() OVER (ORDER BY points DESC, created_at ASC) as rank
         FROM users WHERE is_deleted = FALSE
       ) ranked WHERE id = $1`,
      [userId]
    );
    return rows[0]?.rank ? parseInt(rows[0].rank, 10) : null;
  },
};
