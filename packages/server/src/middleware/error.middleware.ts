import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
      timestamp: new Date().toISOString(),
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다.' },
    timestamp: new Date().toISOString(),
  });
}
