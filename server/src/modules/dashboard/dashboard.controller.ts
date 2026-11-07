import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';

export class DashboardController {
  static async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await DashboardService.getSummary();
      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLeadDistribution(_req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await DashboardService.getLeadDistribution();
      res.json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSalesPerformance(_req: Request, res: Response, next: NextFunction) {
    try {
      const performance = await DashboardService.getSalesPerformance();
      res.json({
        success: true,
        data: performance,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecentActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const activities = await DashboardService.getRecentActivities(limit);
      res.json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }
}
