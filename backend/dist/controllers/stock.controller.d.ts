import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class StockController {
    stockIn(req: AuthRequest, res: Response): Promise<void>;
    stockOut(req: AuthRequest, res: Response): Promise<void>;
    adjust(req: AuthRequest, res: Response): Promise<void>;
    getMovements(req: AuthRequest, res: Response): Promise<void>;
    getProductMovements(req: AuthRequest, res: Response): Promise<void>;
}
export declare const stockController: StockController;
//# sourceMappingURL=stock.controller.d.ts.map