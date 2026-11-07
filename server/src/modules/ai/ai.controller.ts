import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service.js';

export class AIController {
  static async analyzeLead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const analysis = await AIService.analyzeLead(id);
      res.json({
        success: true,
        message: 'Lead analysis generated successfully',
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLatestAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const analysis = await AIService.getLatestAnalysis(id);
      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }
}
