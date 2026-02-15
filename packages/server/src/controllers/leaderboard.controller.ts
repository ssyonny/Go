import { Request, Response, NextFunction } from 'express';
import { leaderboardService } from '../services/leaderboard.service';

function success(res: Response, data: any, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

export const leaderboardController = {
  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const userId = req.user?.userId;

      const result = await leaderboardService.getLeaderboard(limit, offset, userId);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },
};
