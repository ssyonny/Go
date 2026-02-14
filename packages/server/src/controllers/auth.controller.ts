import { Request, Response, NextFunction } from 'express';
import type { AccessTokenPayload } from '../utils/jwt';
import { authService } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

function success(res: Response, data: any, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, nickname } = req.body;
      const result = await authService.register(username, password, nickname);
      return success(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId);
      return success(res, { message: '로그아웃 되었습니다.' });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      return success(res, tokens);
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      return success(res, user);
    } catch (err) {
      next(err);
    }
  },

  async checkUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const available = await authService.checkUsername(req.params.username);
      return success(res, { available });
    } catch (err) {
      next(err);
    }
  },

  async checkNickname(req: Request, res: Response, next: NextFunction) {
    try {
      const available = await authService.checkNickname(req.params.nickname);
      return success(res, { available });
    } catch (err) {
      next(err);
    }
  },
};
