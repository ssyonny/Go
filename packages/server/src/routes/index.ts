import { Router } from 'express';
import authRoutes from './auth.routes';
import lobbyRoutes from './lobby.routes';
import leaderboardRoutes from './leaderboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/lobby', lobbyRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;
