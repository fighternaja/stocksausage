import prisma from '../utils/prisma';
import { MovementType, Prisma } from '@prisma/client';

interface MovementFilters {
  productId?: string;
  type?: MovementType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class StockService {
  async stockIn(productId: string, quantity: number, note: string | undefined, userId: string) {
    if (quantity <= 0) {
      throw { status: 400, message: 'จำนวนต้องมากกว่า 0', error: 'INVALID_QUANTITY' };
    }

    const [updatedProduct, movement] = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw { status: 404, message: 'ไม่พบสินค้า', error: 'PRODUCT_NOT_FOUND' };
      }

      const previousStock = product.stock;
      const newStock = previousStock + quantity;

      const updated = await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: quantity } },
        include: { category: { select: { id: true, name: true } } },
      });

      const mov = await tx.stockMovement.create({
        data: {
          productId,
          userId,
          type: 'IN',
          quantity,
          previousStock,
          newStock,
          note,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true } },
        },
      });

      return [updated, mov];
    });

    return { product: updatedProduct, movement };
  }

  async stockOut(productId: string, quantity: number, note: string | undefined, userId: string) {
    if (quantity <= 0) {
      throw { status: 400, message: 'จำนวนต้องมากกว่า 0', error: 'INVALID_QUANTITY' };
    }

    const [updatedProduct, movement] = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw { status: 404, message: 'ไม่พบสินค้า', error: 'PRODUCT_NOT_FOUND' };
      }

      if (product.stock < quantity) {
        throw {
          status: 400,
          message: `สินค้าในสต๊อกไม่เพียงพอ (คงเหลือ ${product.stock} ${product.unit})`,
          error: 'INSUFFICIENT_STOCK',
        };
      }

      const previousStock = product.stock;
      const newStock = previousStock - quantity;

      const updated = await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
        include: { category: { select: { id: true, name: true } } },
      });

      const mov = await tx.stockMovement.create({
        data: {
          productId,
          userId,
          type: 'OUT',
          quantity,
          previousStock,
          newStock,
          note,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true } },
        },
      });

      return [updated, mov];
    });

    return { product: updatedProduct, movement };
  }

  async adjust(productId: string, quantity: number, note: string | undefined, userId: string) {
    if (quantity < 0) {
      throw { status: 400, message: 'จำนวนไม่สามารถติดลบได้', error: 'INVALID_QUANTITY' };
    }

    const [updatedProduct, movement] = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw { status: 404, message: 'ไม่พบสินค้า', error: 'PRODUCT_NOT_FOUND' };
      }

      const previousStock = product.stock;
      const newStock = quantity;

      const updated = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
        include: { category: { select: { id: true, name: true } } },
      });

      const mov = await tx.stockMovement.create({
        data: {
          productId,
          userId,
          type: 'ADJUSTMENT',
          quantity: Math.abs(newStock - previousStock),
          previousStock,
          newStock,
          note: note || `ปรับ Stock จาก ${previousStock} เป็น ${newStock}`,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true } },
        },
      });

      return [updated, mov];
    });

    return { product: updatedProduct, movement };
  }

  async getMovements(filters: MovementFilters) {
    const { productId, type, userId, startDate, endDate, page = 1, limit = 20 } = filters;

    const where: Prisma.StockMovementWhereInput = {};

    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true, unit: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getProductMovements(productId: string, page = 1, limit = 20) {
    return this.getMovements({ productId, page, limit });
  }
}

export const stockService = new StockService();
