import { Request, Response, NextFunction } from 'express';
import { LeadService } from './lead.service.js';
import { CreateLeadInput, UpdateLeadInput, QueryLeadsInput } from './lead.schema.js';

export class LeadController {
  static async getLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LeadService.getLeads(req.query as unknown as QueryLeadsInput);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.getLeadById(req.params.id);
      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.createLead(req.body as CreateLeadInput);
      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateLead(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.updateLead(req.params.id, req.body as UpdateLeadInput);
      res.json({
        success: true,
        message: 'Lead updated successfully',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteLead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LeadService.deleteLead(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
