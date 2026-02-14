import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh', authController.refresh);
router.get('/profile', authMiddleware, authController.getProfile);
router.get('/check-username/:username', authController.checkUsername);
router.get('/check-nickname/:nickname', authController.checkNickname);

export default router;
