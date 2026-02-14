export type RankTier = '재야' | '중원' | '고수';

export interface User {
  id: string;
  username: string;
  nickname: string;
  rankTier: RankTier;
  rankLevel: number;
  points: number;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
