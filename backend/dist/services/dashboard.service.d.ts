export declare class DashboardService {
    getStats(): Promise<{
        totalProducts: number;
        totalStock: number;
        lowStock: number;
        outOfStock: number;
        totalInventoryValue: number;
        totalRetailValue: number;
    }>;
    getMovementChart(days?: number): Promise<{
        date: string;
        in: number;
        out: number;
        adjustment: number;
    }[]>;
    getLowStockProducts(): Promise<({
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
    })[]>;
    getRecentMovements(): Promise<({
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
    })[]>;
}
export declare const dashboardService: DashboardService;
//# sourceMappingURL=dashboard.service.d.ts.map