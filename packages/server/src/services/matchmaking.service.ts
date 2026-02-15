import crypto from 'crypto';
import { redisClient } from '../config/redis';
import type { GameRoom, BoardSize, RoomStatus } from '@baduk/shared';
import { ApiError } from '../utils/ApiError';

const ROOM_PREFIX = 'room:';
const WAITING_SET = 'rooms:waiting';
const ROOM_TTL = 1800; // 30 minutes

export const matchmakingService = {
  async createRoom(
    userId: string,
    nickname: string,
    rankTier: string,
    rankLevel: number,
    boardSize: BoardSize
  ): Promise<GameRoom> {
    const roomId = crypto.randomUUID();
    const room: GameRoom = {
      roomId,
      hostId: userId,
      hostNickname: nickname,
      hostRankTier: rankTier as GameRoom['hostRankTier'],
      hostRankLevel: rankLevel,
      guestId: null,
      guestNickname: null,
      boardSize,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };

    await redisClient.set(`${ROOM_PREFIX}${roomId}`, JSON.stringify(room), { EX: ROOM_TTL });
    await redisClient.sAdd(WAITING_SET, roomId);

    return room;
  },

  async listWaitingRooms(): Promise<GameRoom[]> {
    const roomIds = await redisClient.sMembers(WAITING_SET);
    if (roomIds.length === 0) return [];

    const keys = roomIds.map((id) => `${ROOM_PREFIX}${id}`);
    const values = await redisClient.mGet(keys);
    const rooms: GameRoom[] = [];

    for (let i = 0; i < roomIds.length; i++) {
      if (!values[i]) {
        // expired room, clean up from set
        await redisClient.sRem(WAITING_SET, roomIds[i]);
        continue;
      }
      try {
        rooms.push(JSON.parse(values[i]!));
      } catch {
        await redisClient.sRem(WAITING_SET, roomIds[i]);
      }
    }

    return rooms;
  },

  async joinRoom(roomId: string, userId: string, nickname: string): Promise<GameRoom> {
    const raw = await redisClient.get(`${ROOM_PREFIX}${roomId}`);
    if (!raw) throw new ApiError(404, 'ROOM_NOT_FOUND', '방을 찾을 수 없습니다.');

    const room: GameRoom = JSON.parse(raw);

    if (room.status !== 'waiting') {
      throw new ApiError(409, 'ROOM_NOT_AVAILABLE', '이미 대국이 시작된 방입니다.');
    }
    if (room.hostId === userId) {
      throw new ApiError(400, 'ROOM_SELF_JOIN', '자신의 방에는 입장할 수 없습니다.');
    }

    room.guestId = userId;
    room.guestNickname = nickname;
    room.status = 'full';

    await redisClient.set(`${ROOM_PREFIX}${roomId}`, JSON.stringify(room), { EX: ROOM_TTL });
    await redisClient.sRem(WAITING_SET, roomId);

    return room;
  },

  async autoMatch(
    userId: string,
    nickname: string,
    rankTier: string,
    rankLevel: number,
    boardSize: BoardSize
  ): Promise<{ room: GameRoom; created: boolean }> {
    const roomIds = await redisClient.sMembers(WAITING_SET);

    for (const roomId of roomIds) {
      const raw = await redisClient.get(`${ROOM_PREFIX}${roomId}`);
      if (!raw) {
        await redisClient.sRem(WAITING_SET, roomId);
        continue;
      }

      try {
        const room: GameRoom = JSON.parse(raw);
        if (room.boardSize === boardSize && room.hostId !== userId && room.status === 'waiting') {
          // Join this room
          room.guestId = userId;
          room.guestNickname = nickname;
          room.status = 'full';

          await redisClient.set(`${ROOM_PREFIX}${roomId}`, JSON.stringify(room), { EX: ROOM_TTL });
          await redisClient.sRem(WAITING_SET, roomId);

          return { room, created: false };
        }
      } catch {
        await redisClient.sRem(WAITING_SET, roomId);
      }
    }

    // No match found, create a new room
    const room = await this.createRoom(userId, nickname, rankTier, rankLevel, boardSize);
    return { room, created: true };
  },

  async getRoomStatus(roomId: string): Promise<GameRoom> {
    const raw = await redisClient.get(`${ROOM_PREFIX}${roomId}`);
    if (!raw) throw new ApiError(404, 'ROOM_NOT_FOUND', '방을 찾을 수 없습니다.');
    return JSON.parse(raw);
  },

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const raw = await redisClient.get(`${ROOM_PREFIX}${roomId}`);
    if (!raw) return;

    const room: GameRoom = JSON.parse(raw);

    if (room.hostId === userId) {
      // Host leaves → delete room
      await redisClient.del(`${ROOM_PREFIX}${roomId}`);
      await redisClient.sRem(WAITING_SET, roomId);
    } else if (room.guestId === userId) {
      // Guest leaves → revert to waiting
      room.guestId = null;
      room.guestNickname = null;
      room.status = 'waiting';
      await redisClient.set(`${ROOM_PREFIX}${roomId}`, JSON.stringify(room), { EX: ROOM_TTL });
      await redisClient.sAdd(WAITING_SET, roomId);
    }
  },
};
