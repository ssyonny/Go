import type { BoardSize } from './board.types';
import type { RankTier } from './user.types';

// === 접속자 ===
export interface OnlineUser {
  userId: string;
  nickname: string;
  rankTier: RankTier;
  rankLevel: number;
}

export interface OnlineUsersResponse {
  users: OnlineUser[];
  totalCount: number;
}

// === 매칭 ===
export type RoomStatus = 'waiting' | 'full' | 'playing' | 'finished';

export interface GameRoom {
  roomId: string;
  hostId: string;
  hostNickname: string;
  hostRankTier: RankTier;
  hostRankLevel: number;
  guestId: string | null;
  guestNickname: string | null;
  boardSize: BoardSize;
  status: RoomStatus;
  createdAt: string;
}

export interface CreateRoomRequest {
  boardSize: BoardSize;
}

export interface CreateRoomResponse {
  room: GameRoom;
}

export interface RoomListResponse {
  rooms: GameRoom[];
}

export interface JoinRoomResponse {
  room: GameRoom;
}

export interface AutoMatchRequest {
  boardSize: BoardSize;
}

export interface AutoMatchResponse {
  room: GameRoom;
  created: boolean;
}

export interface RoomStatusResponse {
  room: GameRoom;
}

// === 리더보드 ===
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  rankTier: RankTier;
  rankLevel: number;
  points: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalPlayers: number;
  myRank: number | null;
}
