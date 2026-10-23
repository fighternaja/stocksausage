import { Response } from 'express';
import { AuthRequest } from '../types';
import { stockService } from '../services/stock.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { MovementType } from '@prisma/client';

export class StockController {
  async stockIn(req: AuthRequest, res: Response) {
    try {
      const { productId, quantity, note } = req.body;
      const result = await stockService.stockIn(productId, quantity, note, req.user!.userId);
      sendSuccess(res, result, 'เพิ่มสินค้าเข้าสต๊อกเรียบร้อยแล้ว', 201);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async stockOut(req: AuthRequest, res: Response) {
    try {
      const { productId, quantity, note } = req.body;
      const result = await stockService.stockOut(productId, quantity, note, req.user!.userId);
      sendSuccess(res, result, 'เบิกสินค้าออกจากสต๊อกเรียบร้อยแล้ว', 201);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async adjust(req: AuthRequest, res: Response) {
    try {
      const { productId, quantity, note } = req.body;
      const result = await stockService.adjust(productId, quantity, note, req.user!.userId);
      sendSuccess(res, result, 'ปรับปรุงสต๊อกเรียบร้อยแล้ว', 201);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async getMovements(req: AuthRequest, res: Response) {
    try {
      const { productId, type, userId, startDate, endDate, page, limit } = req.query;
      const result = await stockService.getMovements({
        productId: productId as string,
        type: type as MovementType,
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      });
      sendPaginated(res, result.items, result.total, result.page, result.limit);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async getProductMovements(req: AuthRequest, res: Response) {
    try {
      const { page, limit } = req.query;
      const result = await stockService.getProductMovements(
        req.params.productId as string,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 20
      );
      sendPaginated(res, result.items, result.total, result.page, result.limit);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }
}

export const stockController = new StockController();
