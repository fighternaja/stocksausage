"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'กรุณากรอกชื่อหมวดหมู่'),
    description: zod_1.z.string().optional(),
});
const updateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'กรุณากรอกชื่อหมวดหมู่').optional(),
    description: zod_1.z.string().optional(),
});
router.get('/', auth_1.authenticate, (req, res) => category_controller_1.categoryController.list(req, res));
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(categorySchema), (req, res) => category_controller_1.categoryController.create(req, res));
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (0, validate_1.validate)(updateCategorySchema), (req, res) => category_controller_1.categoryController.update(req, res));
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('ADMIN'), (req, res) => category_controller_1.categoryController.delete(req, res));
exports.default = router;
//# sourceMappingURL=category.routes.js.map