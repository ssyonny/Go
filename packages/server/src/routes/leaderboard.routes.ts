import { Router } from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalAuthMiddleware, leaderboardController.getLeaderboard);

export default router;
