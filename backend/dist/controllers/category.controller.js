"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
const response_1 = require("../utils/response");
class CategoryController {
    async list(_req, res) {
        try {
            const categories = await category_service_1.categoryService.list();
            (0, response_1.sendSuccess)(res, categories);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async create(req, res) {
        try {
            const { name, description } = req.body;
            const category = await category_service_1.categoryService.create(name, description);
            (0, response_1.sendSuccess)(res, category, 'เพิ่มหมวดหมู่เรียบร้อยแล้ว', 201);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async update(req, res) {
        try {
            const { name, description } = req.body;
            const category = await category_service_1.categoryService.update(req.params.id, name, description);
            (0, response_1.sendSuccess)(res, category, 'แก้ไขหมวดหมู่เรียบร้อยแล้ว');
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async delete(req, res) {
        try {
            const result = await category_service_1.categoryService.delete(req.params.id);
            (0, response_1.sendSuccess)(res, result, 'ลบหมวดหมู่เรียบร้อยแล้ว');
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
}
exports.CategoryController = CategoryController;
exports.categoryController = new CategoryController();
//# sourceMappingURL=category.controller.js.map