import { redisClient } from '../config/redis';
import type { OnlineUser } from '@baduk/shared';

const PREFIX = 'online:';
const TTL = 60; // seconds

export const onlineService = {
  async heartbeat(userId: string, nickname: string, rankTier: string, rankLevel: number): Promise<void> {
    const data = JSON.stringify({ nickname, rankTier, rankLevel });
    await redisClient.set(`${PREFIX}${userId}`, data, { EX: TTL });
  },

  async getOnlineUsers(): Promise<OnlineUser[]> {
    const keys = await redisClient.keys(`${PREFIX}*`);
    if (keys.length === 0) return [];

    const values = await redisClient.mGet(keys);
    const users: OnlineUser[] = [];

    for (let i = 0; i < keys.length; i++) {
      if (!values[i]) continue;
      try {
        const data = JSON.parse(values[i]!);
        users.push({
          userId: keys[i].replace(PREFIX, ''),
          nickname: data.nickname,
          rankTier: data.rankTier,
          rankLevel: data.rankLevel,
        });
      } catch {
        // skip invalid entries
      }
    }

    return users;
  },

  async removeUser(userId: string): Promise<void> {
    await redisClient.del(`${PREFIX}${userId}`);
  },
};
