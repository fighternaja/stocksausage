import { Response } from 'express';
import { AuthRequest } from '../types';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess, sendError } from '../utils/response';

export class DashboardController {
  async getStats(_req: AuthRequest, res: Response) {
    try {
      const stats = await dashboardService.getStats();
      sendSuccess(res, stats);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async getMovementChart(req: AuthRequest, res: Response) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const data = await dashboardService.getMovementChart(days);
      sendSuccess(res, data);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async getLowStockProducts(_req: AuthRequest, res: Response) {
    try {
      const products = await dashboardService.getLowStockProducts();
      sendSuccess(res, products);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }

  async getRecentMovements(_req: AuthRequest, res: Response) {
    try {
      const movements = await dashboardService.getRecentMovements();
      sendSuccess(res, movements);
    } catch (err: any) {
      sendError(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
    }
  }
}

export const dashboardController = new DashboardController();
