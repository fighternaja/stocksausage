export declare class CategoryService {
    list(): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    })[]>;
    create(name: string, description?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    update(id: string, name?: string, description?: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
    }>;
}
export declare const categoryService: CategoryService;
//# sourceMappingURL=category.service.d.ts.map