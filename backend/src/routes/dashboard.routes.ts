import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', (req, res) => dashboardController.getStats(req, res));
router.get('/chart', (req, res) => dashboardController.getMovementChart(req, res));
router.get('/low-stock', (req, res) => dashboardController.getLowStockProducts(req, res));
router.get('/recent', (req, res) => dashboardController.getRecentMovements(req, res));

export default router;
