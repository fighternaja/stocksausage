interface ProductFilters {
    search?: string;
    categoryId?: string;
    status?: 'all' | 'low' | 'out' | 'in-stock';
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class ProductService {
    list(filters: ProductFilters): Promise<{
        items: ({
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
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<{
        stockMovements: ({
            user: {
                id: string;
                name: string;
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
    }>;
    create(data: {
        sku: string;
        name: string;
        description?: string;
        categoryId: string;
        price?: number;
        cost?: number;
        stock?: number;
        minimumStock?: number;
        unit?: string;
        image?: string;
    }, userId?: string): Promise<{
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
    }>;
    update(id: string, data: {
        sku?: string;
        name?: string;
        description?: string;
        categoryId?: string;
        price?: number;
        cost?: number;
        minimumStock?: number;
        unit?: string;
        image?: string;
    }): Promise<{
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
    }>;
    delete(id: string): Promise<{
        id: string;
    }>;
}
export declare const productService: ProductService;
export {};
//# sourceMappingURL=product.service.d.ts.map