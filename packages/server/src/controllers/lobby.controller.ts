import { Request, Response, NextFunction } from 'express';
import { onlineService } from '../services/online.service';
import { matchmakingService } from '../services/matchmaking.service';

function success(res: Response, data: any, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

export const lobbyController = {
  async heartbeat(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, nickname } = req.user!;
      // Fetch rank info from user profile for heartbeat
      const { userRepository } = await import('../repositories/user.repository');
      const user = await userRepository.findById(userId);
      if (user) {
        await onlineService.heartbeat(userId, user.nickname, user.rankTier, user.rankLevel);
      }
      return success(res, { ok: true });
    } catch (err) {
      next(err);
    }
  },

  async getOnlineUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await onlineService.getOnlineUsers();
      return success(res, { users, totalCount: users.length });
    } catch (err) {
      next(err);
    }
  },

  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const { boardSize } = req.body;
      const { userRepository } = await import('../repositories/user.repository');
      const user = await userRepository.findById(userId);
      if (!user) return next(new Error('User not found'));

      const room = await matchmakingService.createRoom(
        userId, user.nickname, user.rankTier, user.rankLevel, boardSize
      );
      return success(res, { room }, 201);
    } catch (err) {
      next(err);
    }
  },

  async listRooms(_req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await matchmakingService.listWaitingRooms();
      return success(res, { rooms });
    } catch (err) {
      next(err);
    }
  },

  async joinRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const { roomId } = req.params;
      const { userRepository } = await import('../repositories/user.repository');
      const user = await userRepository.findById(userId);
      if (!user) return next(new Error('User not found'));

      const room = await matchmakingService.joinRoom(roomId, userId, user.nickname);
      return success(res, { room });
    } catch (err) {
      next(err);
    }
  },

  async autoMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const { boardSize } = req.body;
      const { userRepository } = await import('../repositories/user.repository');
      const user = await userRepository.findById(userId);
      if (!user) return next(new Error('User not found'));

      const result = await matchmakingService.autoMatch(
        userId, user.nickname, user.rankTier, user.rankLevel, boardSize
      );
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getRoomStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const room = await matchmakingService.getRoomStatus(roomId);
      return success(res, { room });
    } catch (err) {
      next(err);
    }
  },

  async leaveRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const { roomId } = req.params;
      await matchmakingService.leaveRoom(roomId, userId);
      return success(res, { ok: true });
    } catch (err) {
      next(err);
    }
  },
};
