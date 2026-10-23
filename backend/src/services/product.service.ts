import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

interface ProductFilters {
  search?: string;
  categoryId?: string;
  status?: 'all' | 'low' | 'out' | 'in-stock';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ProductService {
  async list(filters: ProductFilters) {
    const { search, categoryId, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status === 'low') {
      where.stock = { gt: 0 };
      where.AND = [
        { stock: { gt: 0 } },
        { stock: { lte: prisma.product.fields?.minimumStock as unknown as number || 0 } },
      ];
      // Use raw filtering approach
      delete where.AND;
      // We'll filter low stock with a rawWhere-like approach via Prisma
    }

    if (status === 'out') {
      where.stock = { equals: 0 };
    }

    if (status === 'in-stock') {
      where.stock = { gt: 0 };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    const validSortFields = ['name', 'sku', 'price', 'stock', 'createdAt', 'updatedAt'];
    if (validSortFields.includes(sortBy)) {
      (orderBy as Record<string, string>)[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * limit;

    let [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Filter low stock in memory if needed (stock <= minimumStock and stock > 0)
    if (status === 'low') {
      const allLowStock = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        include: { category: { select: { id: true, name: true } } },
        orderBy,
      });
      const filtered = allLowStock.filter((p) => p.stock <= p.minimumStock);
      total = filtered.length;
      items = filtered.slice(skip, skip + limit);
    }

    return { items, total, page, limit };
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        stockMovements: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!product) {
      throw { status: 404, message: 'ไม่พบสินค้า', error: 'PRODUCT_NOT_FOUND' };
    }

    return product;
  }

  async create(
    data: {
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
    },
    userId?: string
  ) {
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      throw { status: 409, message: 'SKU นี้ถูกใช้งานแล้ว', error: 'SKU_EXISTS' };
    }

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw { status: 404, message: 'ไม่พบหมวดหมู่', error: 'CATEGORY_NOT_FOUND' };
    }

    const initialStock = data.stock || 0;

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data,
        include: { category: { select: { id: true, name: true } } },
      });

      if (initialStock > 0 && userId) {
        await tx.stockMovement.create({
          data: {
            productId: newProduct.id,
            userId,
            type: 'IN',
            quantity: initialStock,
            previousStock: 0,
            newStock: initialStock,
            note: 'สต๊อกเริ่มต้น',
          },
        });
      }

      return newProduct;
    });

    return product;
  }

  async update(
    id: string,
    data: {
      sku?: string;
      name?: string;
      description?: string;
      categoryId?: string;
      price?: number;
      cost?: number;
      minimumStock?: number;
      unit?: string;
      image?: string;
    }
  ) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw { status: 404, message: 'ไม่พบสินค้า', error: 'PRODUCT_NOT_FOUND' };
    }

    if (data.sku && data.sku !== product.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (existingSku) {
        throw { status: 409, message: 'SKU นี้ถูกใช้งานแล้ว', error: 'SKU_EXISTS' };
      }
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) {
        throw { status: 404, message: 'ไม่พบหมวดหมู่', error: 'CATEGORY_NOT_FOUND' };
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } },
    });

    return updated;
  }

  async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw { status: 404, message: 'ไม่พบสินค้า', error: 'PRODUCT_NOT_FOUND' };
    }

    await prisma.product.delete({ where: { id } });
    return { id };
  }
}

export const productService = new ProductService();
