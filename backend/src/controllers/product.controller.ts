import { Response } from 'express';
import { AuthRequest } from '../types';
import { productService } from '../services/product.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export class ProductController {
  async list(req: AuthRequest, res: Response) {
    try {
      const { search, categoryId, status, page, limit, sortBy, sortOrder } = req.query;
      const result = await productService.list({
        search: search as string,
        categoryId: categoryId as string,
        status: status as 'all' | 'low' | 'out' | 'in-stock',
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });
      sendPaginated(res, result.items, result.total, result.page, result.limit);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const product = await productService.getById(req.params.id as string);
      sendSuccess(res, product);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const product = await productService.create(req.body, req.user?.userId);
      sendSuccess(res, product, 'เพิ่มสินค้าเรียบร้อยแล้ว', 201);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const product = await productService.update(req.params.id as string, req.body);
      sendSuccess(res, product, 'แก้ไขสินค้าเรียบร้อยแล้ว');
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await productService.delete(req.params.id as string);
      sendSuccess(res, result, 'ลบสินค้าเรียบร้อยแล้ว');
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }
}

export const productController = new ProductController();
