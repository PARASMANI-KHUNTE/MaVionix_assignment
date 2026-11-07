import { Request, Response, NextFunction } from 'express';
import { FollowUpService } from './followUp.service.js';
import {
  CreateFollowUpInput,
  UpdateFollowUpInput,
  QueryFollowUpsInput,
} from './followUp.schema.js';

export class FollowUpController {
  static async getFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FollowUpService.getFollowUps(
        req.query as unknown as QueryFollowUpsInput
      );
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const followUp = await FollowUpService.createFollowUp(id, req.body as CreateFollowUpInput);
      res.status(201).json({
        success: true,
        message: 'Follow-up created successfully',
        data: followUp,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const followUp = await FollowUpService.updateFollowUp(id, req.body as UpdateFollowUpInput);
      res.json({
        success: true,
        message: 'Follow-up updated successfully',
        data: followUp,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await FollowUpService.deleteFollowUp(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
