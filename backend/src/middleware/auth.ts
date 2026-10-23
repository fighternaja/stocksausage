import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, JwtPayload } from '../types';
import { sendError } from '../utils/response';
import { Role } from '@prisma/client';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'กรุณาเข้าสู่ระบบ', 'UNAUTHORIZED', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    sendError(res, 'Token ไม่ถูกต้องหรือหมดอายุ', 'INVALID_TOKEN', 401);
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'กรุณาเข้าสู่ระบบ', 'UNAUTHORIZED', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 'คุณไม่มีสิทธิ์เข้าถึง', 'FORBIDDEN', 403);
      return;
    }

    next();
  };
}
