import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';

const router = Router();

router.get('/summary', DashboardController.getSummary);
router.get('/lead-distribution', DashboardController.getLeadDistribution);
router.get('/sales-performance', DashboardController.getSalesPerformance);
router.get('/recent-activities', DashboardController.getRecentActivities);

export default router;
