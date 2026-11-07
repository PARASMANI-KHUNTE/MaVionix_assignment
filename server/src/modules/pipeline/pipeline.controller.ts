import { Request, Response, NextFunction } from 'express';
import { PipelineService } from './pipeline.service.js';
import { UpdateStatusInput } from './pipeline.schema.js';

export class PipelineController {
  static async getPipeline(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PipelineService.getPipeline();
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateLeadStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body as UpdateStatusInput;
      const updatedLead = await PipelineService.updateLeadStatus(id, status);
      res.json({
        success: true,
        message: `Lead status updated to ${status}`,
        data: updatedLead,
      });
    } catch (error) {
      next(error);
    }
  }
}
