"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockController = exports.StockController = void 0;
const stock_service_1 = require("../services/stock.service");
const response_1 = require("../utils/response");
class StockController {
    async stockIn(req, res) {
        try {
            const { productId, quantity, note } = req.body;
            const result = await stock_service_1.stockService.stockIn(productId, quantity, note, req.user.userId);
            (0, response_1.sendSuccess)(res, result, 'เพิ่มสินค้าเข้าสต๊อกเรียบร้อยแล้ว', 201);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async stockOut(req, res) {
        try {
            const { productId, quantity, note } = req.body;
            const result = await stock_service_1.stockService.stockOut(productId, quantity, note, req.user.userId);
            (0, response_1.sendSuccess)(res, result, 'เบิกสินค้าออกจากสต๊อกเรียบร้อยแล้ว', 201);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async adjust(req, res) {
        try {
            const { productId, quantity, note } = req.body;
            const result = await stock_service_1.stockService.adjust(productId, quantity, note, req.user.userId);
            (0, response_1.sendSuccess)(res, result, 'ปรับปรุงสต๊อกเรียบร้อยแล้ว', 201);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async getMovements(req, res) {
        try {
            const { productId, type, userId, startDate, endDate, page, limit } = req.query;
            const result = await stock_service_1.stockService.getMovements({
                productId: productId,
                type: type,
                userId: userId,
                startDate: startDate,
                endDate: endDate,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 20,
            });
            (0, response_1.sendPaginated)(res, result.items, result.total, result.page, result.limit);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async getProductMovements(req, res) {
        try {
            const { page, limit } = req.query;
            const result = await stock_service_1.stockService.getProductMovements(req.params.productId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20);
            (0, response_1.sendPaginated)(res, result.items, result.total, result.page, result.limit);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
}
exports.StockController = StockController;
exports.stockController = new StockController();
//# sourceMappingURL=stock.controller.js.map