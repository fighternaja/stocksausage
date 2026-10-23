"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = exports.CategoryService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class CategoryService {
    async list() {
        const categories = await prisma_1.default.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        });
        return categories;
    }
    async create(name, description) {
        const existing = await prisma_1.default.category.findUnique({ where: { name } });
        if (existing) {
            throw { status: 409, message: 'หมวดหมู่นี้มีอยู่แล้ว', error: 'CATEGORY_EXISTS' };
        }
        const category = await prisma_1.default.category.create({
            data: { name, description },
        });
        return category;
    }
    async update(id, name, description) {
        const category = await prisma_1.default.category.findUnique({ where: { id } });
        if (!category) {
            throw { status: 404, message: 'ไม่พบหมวดหมู่', error: 'CATEGORY_NOT_FOUND' };
        }
        if (name && name !== category.name) {
            const existing = await prisma_1.default.category.findUnique({ where: { name } });
            if (existing) {
                throw { status: 409, message: 'ชื่อหมวดหมู่นี้ถูกใช้งานแล้ว', error: 'CATEGORY_EXISTS' };
            }
        }
        const updated = await prisma_1.default.category.update({
            where: { id },
            data: { ...(name && { name }), ...(description !== undefined && { description }) },
        });
        return updated;
    }
    async delete(id) {
        const category = await prisma_1.default.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });
        if (!category) {
            throw { status: 404, message: 'ไม่พบหมวดหมู่', error: 'CATEGORY_NOT_FOUND' };
        }
        if (category._count.products > 0) {
            throw {
                status: 400,
                message: `ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีสินค้า ${category._count.products} รายการ`,
                error: 'CATEGORY_HAS_PRODUCTS',
            };
        }
        await prisma_1.default.category.delete({ where: { id } });
        return { id };
    }
}
exports.CategoryService = CategoryService;
exports.categoryService = new CategoryService();
//# sourceMappingURL=category.service.js.map