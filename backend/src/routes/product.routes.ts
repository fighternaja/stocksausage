import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createProductSchema = z.object({
  sku: z.string().min(1, 'กรุณากรอก SKU'),
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  description: z.string().optional(),
  categoryId: z.string().uuid('กรุณาเลือกหมวดหมู่'),
  price: z.number().min(0, 'ราคาต้องไม่ติดลบ').default(0),
  cost: z.number().min(0, 'ต้นทุนต้องไม่ติดลบ').default(0),
  stock: z.number().int().min(0, 'จำนวน Stock ต้องไม่ติดลบ').default(0),
  minimumStock: z.number().int().min(0, 'Minimum Stock ต้องไม่ติดลบ').default(0),
  unit: z.string().default('ชิ้น'),
  image: z.string().optional(),
});

const updateProductSchema = z.object({
  sku: z.string().min(1, 'กรุณากรอก SKU').optional(),
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า').optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid('กรุณาเลือกหมวดหมู่').optional(),
  price: z.number().min(0, 'ราคาต้องไม่ติดลบ').optional(),
  cost: z.number().min(0, 'ต้นทุนต้องไม่ติดลบ').optional(),
  minimumStock: z.number().int().min(0, 'Minimum Stock ต้องไม่ติดลบ').optional(),
  unit: z.string().optional(),
  image: z.string().optional().nullable(),
});

router.get('/', authenticate, (req, res) => productController.list(req, res));
router.get('/:id', authenticate, (req, res) => productController.getById(req, res));
router.post('/', authenticate, authorize('ADMIN'), validate(createProductSchema), (req, res) => productController.create(req, res));
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateProductSchema), (req, res) => productController.update(req, res));
router.delete('/:id', authenticate, authorize('ADMIN'), (req, res) => productController.delete(req, res));

export default router;
