"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stock_controller_1 = require("../controllers/stock.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const stockInOutSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('กรุณาเลือกสินค้า'),
    quantity: zod_1.z.number().int().positive('จำนวนต้องมากกว่า 0'),
    note: zod_1.z.string().optional(),
});
const adjustSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('กรุณาเลือกสินค้า'),
    quantity: zod_1.z.number().int().min(0, 'จำนวนต้องไม่ติดลบ'),
    note: zod_1.z.string().optional(),
});
router.post('/in', auth_1.authenticate, (0, validate_1.validate)(stockInOutSchema), (req, res) => stock_controller_1.stockController.stockIn(req, res));
router.post('/out', auth_1.authenticate, (0, validate_1.validate)(stockInOutSchema), (req, res) => stock_controller_1.stockController.stockOut(req, res));
router.post('/adjust', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(adjustSchema), (req, res) => stock_controller_1.stockController.adjust(req, res));
router.get('/movements', auth_1.authenticate, (req, res) => stock_controller_1.stockController.getMovements(req, res));
router.get('/movements/:productId', auth_1.authenticate, (req, res) => stock_controller_1.stockController.getProductMovements(req, res));
exports.default = router;
//# sourceMappingURL=stock.routes.js.map