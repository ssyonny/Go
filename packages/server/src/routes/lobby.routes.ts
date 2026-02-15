import { Router } from 'express';
import { lobbyController } from '../controllers/lobby.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/heartbeat', authMiddleware, lobbyController.heartbeat);
router.get('/online-users', authMiddleware, lobbyController.getOnlineUsers);
router.post('/rooms', authMiddleware, lobbyController.createRoom);
router.get('/rooms', lobbyController.listRooms);
router.post('/rooms/:roomId/join', authMiddleware, lobbyController.joinRoom);
router.post('/auto-match', authMiddleware, lobbyController.autoMatch);
router.get('/rooms/:roomId', authMiddleware, lobbyController.getRoomStatus);
router.post('/rooms/:roomId/leave', authMiddleware, lobbyController.leaveRoom);

export default router;
