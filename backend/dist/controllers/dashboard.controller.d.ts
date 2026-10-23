import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class DashboardController {
    getStats(_req: AuthRequest, res: Response): Promise<void>;
    getMovementChart(req: AuthRequest, res: Response): Promise<void>;
    getLowStockProducts(_req: AuthRequest, res: Response): Promise<void>;
    getRecentMovements(_req: AuthRequest, res: Response): Promise<void>;
}
export declare const dashboardController: DashboardController;
//# sourceMappingURL=dashboard.controller.d.ts.map