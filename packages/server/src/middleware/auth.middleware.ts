import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'AUTH_UNAUTHORIZED', '인증이 필요합니다.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'AUTH_TOKEN_EXPIRED', '토큰이 만료되었습니다.'));
    }
    return next(new ApiError(401, 'AUTH_TOKEN_INVALID', '유효하지 않은 토큰입니다.'));
  }
}
