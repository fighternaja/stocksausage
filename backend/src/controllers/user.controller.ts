import { Response } from 'express';
import { AuthRequest } from '../types';
import { userService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response';

export class UserController {
  async list(_req: AuthRequest, res: Response) {
    try {
      const users = await userService.list();
      sendSuccess(res, users);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const user = await userService.create(name, email, password, role);
      sendSuccess(res, user, 'เพิ่มผู้ใช้เรียบร้อยแล้ว', 201);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const user = await userService.update(req.params.id as string, req.body);
      sendSuccess(res, user, 'แก้ไขผู้ใช้เรียบร้อยแล้ว');
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await userService.delete(req.params.id as string, req.user!.userId);
      sendSuccess(res, result, 'ลบผู้ใช้เรียบร้อยแล้ว');
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }
}

export const userController = new UserController();
