import { Response } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const user = await authService.register(name, email, password, role);
      sendSuccess(res, user, 'สร้างบัญชีเรียบร้อยแล้ว', 201);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'เข้าสู่ระบบสำเร็จ');
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async logout(_req: AuthRequest, res: Response) {
    sendSuccess(res, null, 'ออกจากระบบสำเร็จ');
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await authService.me(req.user!.userId);
      sendSuccess(res, user);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }
}

export const authController = new AuthController();
