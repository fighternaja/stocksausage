import prisma from '../utils/prisma';

export class CategoryService {
  async list() {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  async create(name: string, description?: string) {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      throw { status: 409, message: 'หมวดหมู่นี้มีอยู่แล้ว', error: 'CATEGORY_EXISTS' };
    }

    const category = await prisma.category.create({
      data: { name, description },
    });
    return category;
  }

  async update(id: string, name?: string, description?: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw { status: 404, message: 'ไม่พบหมวดหมู่', error: 'CATEGORY_NOT_FOUND' };
    }

    if (name && name !== category.name) {
      const existing = await prisma.category.findUnique({ where: { name } });
      if (existing) {
        throw { status: 409, message: 'ชื่อหมวดหมู่นี้ถูกใช้งานแล้ว', error: 'CATEGORY_EXISTS' };
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { ...(name && { name }), ...(description !== undefined && { description }) },
    });
    return updated;
  }

  async delete(id: string) {
    const category = await prisma.category.findUnique({
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

    await prisma.category.delete({ where: { id } });
    return { id };
  }
}

export const categoryService = new CategoryService();
