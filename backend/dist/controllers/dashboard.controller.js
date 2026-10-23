"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const response_1 = require("../utils/response");
class DashboardController {
    async getStats(_req, res) {
        try {
            const stats = await dashboard_service_1.dashboardService.getStats();
            (0, response_1.sendSuccess)(res, stats);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async getMovementChart(req, res) {
        try {
            const days = req.query.days ? parseInt(req.query.days) : 7;
            const data = await dashboard_service_1.dashboardService.getMovementChart(days);
            (0, response_1.sendSuccess)(res, data);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async getLowStockProducts(_req, res) {
        try {
            const products = await dashboard_service_1.dashboardService.getLowStockProducts();
            (0, response_1.sendSuccess)(res, products);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async getRecentMovements(_req, res) {
        try {
            const movements = await dashboard_service_1.dashboardService.getRecentMovements();
            (0, response_1.sendSuccess)(res, movements);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map