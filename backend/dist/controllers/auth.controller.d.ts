import { Response } from 'express';
import { AuthRequest } from '../types';
export declare class AuthController {
    register(req: AuthRequest, res: Response): Promise<void>;
    login(req: AuthRequest, res: Response): Promise<void>;
    logout(_req: AuthRequest, res: Response): Promise<void>;
    me(req: AuthRequest, res: Response): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map