"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
const response_1 = require("../utils/response");
class ProductController {
    async list(req, res) {
        try {
            const { search, categoryId, status, page, limit, sortBy, sortOrder } = req.query;
            const result = await product_service_1.productService.list({
                search: search,
                categoryId: categoryId,
                status: status,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                sortBy: sortBy,
                sortOrder: sortOrder,
            });
            (0, response_1.sendPaginated)(res, result.items, result.total, result.page, result.limit);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async getById(req, res) {
        try {
            const product = await product_service_1.productService.getById(req.params.id);
            (0, response_1.sendSuccess)(res, product);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async create(req, res) {
        try {
            const product = await product_service_1.productService.create(req.body, req.user?.userId);
            (0, response_1.sendSuccess)(res, product, 'เพิ่มสินค้าเรียบร้อยแล้ว', 201);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async update(req, res) {
        try {
            const product = await product_service_1.productService.update(req.params.id, req.body);
            (0, response_1.sendSuccess)(res, product, 'แก้ไขสินค้าเรียบร้อยแล้ว');
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async delete(req, res) {
        try {
            const result = await product_service_1.productService.delete(req.params.id);
            (0, response_1.sendSuccess)(res, result, 'ลบสินค้าเรียบร้อยแล้ว');
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
}
exports.ProductController = ProductController;
exports.productController = new ProductController();
//# sourceMappingURL=product.controller.js.map