export declare class UserService {
    list(): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            stockMovements: number;
        };
    }[]>;
    create(name: string, email: string, password: string, role: 'ADMIN' | 'STAFF'): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
    }>;
    update(id: string, data: {
        name?: string;
        email?: string;
        role?: 'ADMIN' | 'STAFF';
        status?: 'ACTIVE' | 'DISABLED';
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string, currentUserId: string): Promise<{
        id: string;
    }>;
}
export declare const userService: UserService;
//# sourceMappingURL=user.service.d.ts.map