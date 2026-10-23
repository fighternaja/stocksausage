import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหมวดหมู่'),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหมวดหมู่').optional(),
  description: z.string().optional(),
});

router.get('/', authenticate, (req, res) => categoryController.list(req, res));
router.post('/', authenticate, authorize('ADMIN'), validate(categorySchema), (req, res) => categoryController.create(req, res));
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateCategorySchema), (req, res) => categoryController.update(req, res));
router.delete('/:id', authenticate, authorize('ADMIN'), (req, res) => categoryController.delete(req, res));

export default router;
