import { MovementType } from '@prisma/client';
interface MovementFilters {
    productId?: string;
    type?: MovementType;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export declare class StockService {
    stockIn(productId: string, quantity: number, note: string | undefined, userId: string): Promise<{
        product: {
            category: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            categoryId: string;
            sku: string;
            price: number;
            stock: number;
            description: string | null;
            cost: number;
            minimumStock: number;
            unit: string;
            image: string | null;
        };
        movement: {
            user: {
                id: string;
                name: string;
            };
            product: {
                id: string;
                name: string;
                sku: string;
            };
        } & {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MovementType;
            quantity: number;
            previousStock: number;
            newStock: number;
            note: string | null;
            productId: string;
            userId: string;
        };
    }>;
    stockOut(productId: string, quantity: number, note: string | undefined, userId: string): Promise<{
        product: {
            category: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            categoryId: string;
            sku: string;
            price: number;
            stock: number;
            description: string | null;
            cost: number;
            minimumStock: number;
            unit: string;
            image: string | null;
        };
        movement: {
            user: {
                id: string;
                name: string;
            };
            product: {
                id: string;
                name: string;
                sku: string;
            };
        } & {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MovementType;
            quantity: number;
            previousStock: number;
            newStock: number;
            note: string | null;
            productId: string;
            userId: string;
        };
    }>;
    adjust(productId: string, quantity: number, note: string | undefined, userId: string): Promise<{
        product: {
            category: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            categoryId: string;
            sku: string;
            price: number;
            stock: number;
            description: string | null;
            cost: number;
            minimumStock: number;
            unit: string;
            image: string | null;
        };
        movement: {
            user: {
                id: string;
                name: string;
            };
            product: {
                id: string;
                name: string;
                sku: string;
            };
        } & {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MovementType;
            quantity: number;
            previousStock: number;
            newStock: number;
            note: string | null;
            productId: string;
            userId: string;
        };
    }>;
    getMovements(filters: MovementFilters): Promise<{
        items: ({
            user: {
                id: string;
                name: string;
            };
            product: {
                id: string;
                name: string;
                sku: string;
                unit: string;
            };
        } & {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MovementType;
            quantity: number;
            previousStock: number;
            newStock: number;
            note: string | null;
            productId: string;
            userId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getProductMovements(productId: string, page?: number, limit?: number): Promise<{
        items: ({
            user: {
                id: string;
                name: string;
            };
            product: {
                id: string;
                name: string;
                sku: string;
                unit: string;
            };
        } & {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MovementType;
            quantity: number;
            previousStock: number;
            newStock: number;
            note: string | null;
            productId: string;
            userId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
}
export declare const stockService: StockService;
export {};
//# sourceMappingURL=stock.service.d.ts.map