import { Router } from 'express';
import { stockController } from '../controllers/stock.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const stockInOutSchema = z.object({
  productId: z.string().uuid('กรุณาเลือกสินค้า'),
  quantity: z.number().int().positive('จำนวนต้องมากกว่า 0'),
  note: z.string().optional(),
});

const adjustSchema = z.object({
  productId: z.string().uuid('กรุณาเลือกสินค้า'),
  quantity: z.number().int().min(0, 'จำนวนต้องไม่ติดลบ'),
  note: z.string().optional(),
});

router.post('/in', authenticate, validate(stockInOutSchema), (req, res) => stockController.stockIn(req, res));
router.post('/out', authenticate, validate(stockInOutSchema), (req, res) => stockController.stockOut(req, res));
router.post('/adjust', authenticate, authorize('ADMIN'), validate(adjustSchema), (req, res) => stockController.adjust(req, res));
router.get('/movements', authenticate, (req, res) => stockController.getMovements(req, res));
router.get('/movements/:productId', authenticate, (req, res) => stockController.getProductMovements(req, res));

export default router;
