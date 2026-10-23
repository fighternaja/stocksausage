"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const createProductSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1, 'กรุณากรอก SKU'),
    name: zod_1.z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
    description: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().uuid('กรุณาเลือกหมวดหมู่'),
    price: zod_1.z.number().min(0, 'ราคาต้องไม่ติดลบ').default(0),
    cost: zod_1.z.number().min(0, 'ต้นทุนต้องไม่ติดลบ').default(0),
    stock: zod_1.z.number().int().min(0, 'จำนวน Stock ต้องไม่ติดลบ').default(0),
    minimumStock: zod_1.z.number().int().min(0, 'Minimum Stock ต้องไม่ติดลบ').default(0),
    unit: zod_1.z.string().default('ชิ้น'),
    image: zod_1.z.string().optional(),
});
const updateProductSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1, 'กรุณากรอก SKU').optional(),
    name: zod_1.z.string().min(1, 'กรุณากรอกชื่อสินค้า').optional(),
    description: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().uuid('กรุณาเลือกหมวดหมู่').optional(),
    price: zod_1.z.number().min(0, 'ราคาต้องไม่ติดลบ').optional(),
    cost: zod_1.z.number().min(0, 'ต้นทุนต้องไม่ติดลบ').optional(),
    minimumStock: zod_1.z.number().int().min(0, 'Minimum Stock ต้องไม่ติดลบ').optional(),
    unit: zod_1.z.string().optional(),
    image: zod_1.z.string().optional().nullable(),
});
router.get('/', auth_1.authenticate, (req, res) => product_controller_1.productController.list(req, res));
router.get('/:id', auth_1.authenticate, (req, res) => product_controller_1.productController.getById(req, res));
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(createProductSchema), (req, res) => product_controller_1.productController.create(req, res));
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(updateProductSchema), (req, res) => product_controller_1.productController.update(req, res));
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => product_controller_1.productController.delete(req, res));
exports.default = router;
//# sourceMappingURL=product.routes.js.map