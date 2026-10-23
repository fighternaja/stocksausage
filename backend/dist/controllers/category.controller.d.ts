import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class CategoryController {
    list(_req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
}
export declare const categoryController: CategoryController;
//# sourceMappingURL=category.controller.d.ts.map