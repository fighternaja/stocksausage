"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
class UserService {
    async list() {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { stockMovements: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return users;
    }
    async create(name, email, password, role) {
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            throw { status: 409, message: 'อีเมลนี้ถูกใช้งานแล้ว', error: 'EMAIL_EXISTS' };
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.default.user.create({
            data: { name, email, password: hashedPassword, role },
            select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
        });
        return user;
    }
    async update(id, data) {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            throw { status: 404, message: 'ไม่พบผู้ใช้', error: 'USER_NOT_FOUND' };
        }
        if (data.email && data.email !== user.email) {
            const existing = await prisma_1.default.user.findUnique({ where: { email: data.email } });
            if (existing) {
                throw { status: 409, message: 'อีเมลนี้ถูกใช้งานแล้ว', error: 'EMAIL_EXISTS' };
            }
        }
        const updated = await prisma_1.default.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
        });
        return updated;
    }
    async delete(id, currentUserId) {
        if (id === currentUserId) {
            throw { status: 400, message: 'ไม่สามารถลบบัญชีตัวเองได้', error: 'CANNOT_DELETE_SELF' };
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id },
            include: { _count: { select: { stockMovements: true } } },
        });
        if (!user) {
            throw { status: 404, message: 'ไม่พบผู้ใช้', error: 'USER_NOT_FOUND' };
        }
        if (user._count.stockMovements > 0) {
            throw {
                status: 400,
                message: 'ไม่สามารถลบผู้ใช้นี้ได้ เนื่องจากมีประวัติทำรายการสต๊อกในระบบ (แนะนำให้เปลี่ยนสถานะเป็นระงับการใช้งานแทน)',
                error: 'USER_HAS_MOVEMENTS',
            };
        }
        await prisma_1.default.user.delete({ where: { id } });
        return { id };
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=user.service.js.map