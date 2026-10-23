import { Response } from 'express';
import { AuthRequest } from '../types';
import { categoryService } from '../services/category.service';
import { sendSuccess, sendError } from '../utils/response';

export class CategoryController {
  async list(_req: AuthRequest, res: Response) {
    try {
      const categories = await categoryService.list();
      sendSuccess(res, categories);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { name, description } = req.body;
      const category = await categoryService.create(name, description);
      sendSuccess(res, category, 'เพิ่มหมวดหมู่เรียบร้อยแล้ว', 201);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { name, description } = req.body;
      const category = await categoryService.update(req.params.id as string, name, description);
      sendSuccess(res, category, 'แก้ไขหมวดหมู่เรียบร้อยแล้ว');
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await categoryService.delete(req.params.id as string);
      sendSuccess(res, result, 'ลบหมวดหมู่เรียบร้อยแล้ว');
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }
}

export const categoryController = new CategoryController();
