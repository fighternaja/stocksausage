"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/stats', (req, res) => dashboard_controller_1.dashboardController.getStats(req, res));
router.get('/chart', (req, res) => dashboard_controller_1.dashboardController.getMovementChart(req, res));
router.get('/low-stock', (req, res) => dashboard_controller_1.dashboardController.getLowStockProducts(req, res));
router.get('/recent', (req, res) => dashboard_controller_1.dashboardController.getRecentMovements(req, res));
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map