"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class DashboardService {
    async getStats() {
        const [totalProducts, totalStock, outOfStock] = await Promise.all([
            prisma_1.default.product.count(),
            prisma_1.default.product.aggregate({ _sum: { stock: true } }),
            prisma_1.default.product.count({ where: { stock: { equals: 0 } } }),
        ]);
        // Get all products to compute inventory value and low stock
        const allProducts = await prisma_1.default.product.findMany({
            select: { stock: true, price: true, cost: true, minimumStock: true },
        });
        const lowStock = allProducts.filter((p) => p.stock > 0 && p.stock <= p.minimumStock).length;
        const totalInventoryValue = allProducts.reduce((sum, p) => sum + p.cost * p.stock, 0);
        const totalRetailValue = allProducts.reduce((sum, p) => sum + p.price * p.stock, 0);
        return {
            totalProducts,
            totalStock: totalStock._sum.stock || 0,
            lowStock,
            outOfStock,
            totalInventoryValue,
            totalRetailValue,
        };
    }
    async getMovementChart(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        const movements = await prisma_1.default.stockMovement.findMany({
            where: { createdAt: { gte: startDate } },
            select: { type: true, quantity: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        // Group by date
        const chartData = {};
        const toLocalDateStr = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };
        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = toLocalDateStr(date);
            chartData[dateStr] = { date: dateStr, in: 0, out: 0, adjustment: 0 };
        }
        movements.forEach((m) => {
            const dateStr = toLocalDateStr(m.createdAt);
            if (chartData[dateStr]) {
                if (m.type === 'IN')
                    chartData[dateStr].in += m.quantity;
                else if (m.type === 'OUT')
                    chartData[dateStr].out += m.quantity;
                else
                    chartData[dateStr].adjustment += m.quantity;
            }
        });
        return Object.values(chartData);
    }
    async getLowStockProducts() {
        const products = await prisma_1.default.product.findMany({
            where: { stock: { gt: 0 } },
            include: { category: { select: { id: true, name: true } } },
            orderBy: { stock: 'asc' },
        });
        return products.filter((p) => p.stock <= p.minimumStock).slice(0, 10);
    }
    async getRecentMovements() {
        return prisma_1.default.stockMovement.findMany({
            include: {
                product: { select: { id: true, name: true, sku: true } },
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
//# sourceMappingURL=dashboard.service.js.map