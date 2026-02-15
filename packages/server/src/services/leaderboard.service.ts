import { leaderboardRepository } from '../repositories/leaderboard.repository';
import type { LeaderboardEntry, LeaderboardResponse } from '@baduk/shared';

export const leaderboardService = {
  async getLeaderboard(limit: number, offset: number, userId?: string): Promise<LeaderboardResponse> {
    const [rows, totalPlayers] = await Promise.all([
      leaderboardRepository.getTopPlayers(limit, offset),
      leaderboardRepository.getTotalCount(),
    ]);

    const entries: LeaderboardEntry[] = rows.map((row: any) => ({
      rank: parseInt(row.rank, 10),
      userId: row.id,
      nickname: row.nickname,
      rankTier: row.rank_tier,
      rankLevel: row.rank_level,
      points: row.points,
    }));

    let myRank: number | null = null;
    if (userId) {
      myRank = await leaderboardRepository.getUserRank(userId);
    }

    return { entries, totalPlayers, myRank };
  },
};
