import crypto from 'crypto';
import { validateUsername, validatePassword, validateNickname } from '@baduk/shared';
import type { AuthResponse } from '@baduk/shared';
import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const authService = {
  async register(username: string, password: string, nickname: string): Promise<AuthResponse> {
    const usernameCheck = validateUsername(username);
    if (!usernameCheck.valid) throw new ApiError(400, 'VALIDATION_ERROR', usernameCheck.error!);

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) throw new ApiError(400, 'VALIDATION_ERROR', passwordCheck.error!);

    const nicknameCheck = validateNickname(nickname);
    if (!nicknameCheck.valid) throw new ApiError(400, 'VALIDATION_ERROR', nicknameCheck.error!);

    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) throw new ApiError(409, 'USER_USERNAME_TAKEN', '이미 사용 중인 아이디입니다.');

    const existingNickname = await userRepository.findByNickname(nickname);
    if (existingNickname) throw new ApiError(409, 'USER_NICKNAME_TAKEN', '이미 사용 중인 닉네임입니다.');

    const passwordHash = await hashPassword(password);
    const user = await userRepository.create(username, passwordHash, nickname);

    const accessToken = signAccessToken({ userId: user.id, username: user.username, nickname: user.nickname });
    const refreshToken = signRefreshToken({ userId: user.id });

    await userRepository.updateRefreshToken(user.id, hashToken(refreshToken));

    return { user, accessToken, refreshToken };
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const user = await userRepository.findByUsername(username);
    if (!user) throw new ApiError(401, 'AUTH_INVALID_CREDENTIALS', '아이디 또는 비밀번호가 올바르지 않습니다.');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new ApiError(401, 'AUTH_INVALID_CREDENTIALS', '아이디 또는 비밀번호가 올바르지 않습니다.');

    await userRepository.updateLastLogin(user.id);

    const accessToken = signAccessToken({ userId: user.id, username: user.username, nickname: user.nickname });
    const refreshToken = signRefreshToken({ userId: user.id });

    await userRepository.updateRefreshToken(user.id, hashToken(refreshToken));

    const { passwordHash: _, ...userData } = user;
    return { user: userData, accessToken, refreshToken };
  },

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  },

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new ApiError(401, 'AUTH_TOKEN_INVALID', '유효하지 않은 리프레시 토큰입니다.');
    }

    const storedHash = await userRepository.getRefreshToken(payload.userId);
    if (!storedHash || storedHash !== hashToken(token)) {
      throw new ApiError(401, 'AUTH_TOKEN_INVALID', '유효하지 않은 리프레시 토큰입니다.');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) throw new ApiError(401, 'AUTH_TOKEN_INVALID', '사용자를 찾을 수 없습니다.');

    const newAccessToken = signAccessToken({ userId: user.id, username: user.username, nickname: user.nickname });
    const newRefreshToken = signRefreshToken({ userId: user.id });

    await userRepository.updateRefreshToken(user.id, hashToken(newRefreshToken));

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
    return user;
  },

  async checkUsername(username: string): Promise<boolean> {
    const user = await userRepository.findByUsername(username);
    return !user;
  },

  async checkNickname(nickname: string): Promise<boolean> {
    const user = await userRepository.findByNickname(nickname);
    return !user;
  },
};
