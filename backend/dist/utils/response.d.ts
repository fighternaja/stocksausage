import { Response } from 'express';
export declare function sendSuccess<T>(res: Response, data: T, message?: string, statusCode?: number): Response<any, Record<string, any>>;
export declare function sendError(res: Response, message: string, error?: string, statusCode?: number): Response<any, Record<string, any>>;
export declare function sendPaginated<T>(res: Response, items: T[], total: number, page: number, limit: number, message?: string): Response<any, Record<string, any>>;
//# sourceMappingURL=response.d.ts.map