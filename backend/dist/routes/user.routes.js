"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'กรุณากรอกชื่อ'),
    email: zod_1.z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: zod_1.z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
    role: zod_1.z.enum(['ADMIN', 'STAFF']),
});
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'กรุณากรอกชื่อ').optional(),
    email: zod_1.z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional(),
    role: zod_1.z.enum(['ADMIN', 'STAFF']).optional(),
    status: zod_1.z.enum(['ACTIVE', 'DISABLED']).optional(),
});
router.use(auth_1.authenticate, (0, auth_1.authorize)('ADMIN'));
router.get('/', (req, res) => user_controller_1.userController.list(req, res));
router.post('/', (0, validate_1.validate)(createUserSchema), (req, res) => user_controller_1.userController.create(req, res));
router.put('/:id', (0, validate_1.validate)(updateUserSchema), (req, res) => user_controller_1.userController.update(req, res));
router.delete('/:id', (req, res) => user_controller_1.userController.delete(req, res));
exports.default = router;
//# sourceMappingURL=user.routes.js.map