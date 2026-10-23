"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'กรุณากรอกชื่อ'),
    email: zod_1.z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: zod_1.z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
    role: zod_1.z.enum(['ADMIN', 'STAFF']).optional().default('STAFF'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: zod_1.z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});
router.post('/register', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(registerSchema), (req, res) => auth_controller_1.authController.register(req, res));
router.post('/login', (0, validate_1.validate)(loginSchema), (req, res) => auth_controller_1.authController.login(req, res));
router.post('/logout', auth_1.authenticate, (req, res) => auth_controller_1.authController.logout(req, res));
router.get('/me', auth_1.authenticate, (req, res) => auth_controller_1.authController.me(req, res));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map