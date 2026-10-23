import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  role: z.enum(['ADMIN', 'STAFF']),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ').optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional(),
  role: z.enum(['ADMIN', 'STAFF']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
});

router.use(authenticate, authorize('ADMIN'));

router.get('/', (req, res) => userController.list(req, res));
router.post('/', validate(createUserSchema), (req, res) => userController.create(req, res));
router.put('/:id', validate(updateUserSchema), (req, res) => userController.update(req, res));
router.delete('/:id', (req, res) => userController.delete(req, res));

export default router;
