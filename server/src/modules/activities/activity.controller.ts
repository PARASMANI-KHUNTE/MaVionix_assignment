import { Request, Response, NextFunction } from 'express';
import { ActivityService } from './activity.service.js';
import { CreateActivityInput } from './activity.schema.js';

export class ActivityController {
  static async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const activities = await ActivityService.getActivitiesByLeadId(id);
      res.json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const activity = await ActivityService.createActivity(id, req.body as CreateActivityInput);
      res.status(201).json({
        success: true,
        message: 'Activity recorded successfully',
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  }
}
