import { Request, Response, NextFunction } from 'express';
import { NeonRealtimeService } from './realtime.service.js';

export async function getRealtimeConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const config = NeonRealtimeService.getConfig();
    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
}

export async function sealLeadsQuery(req: Request, res: Response, next: NextFunction) {
  try {
    const sealed = await NeonRealtimeService.sealLeadsQuery();
    res.json({
      success: true,
      data: sealed,
    });
  } catch (error) {
    next(error);
  }
}

export async function sealPipelineQuery(req: Request, res: Response, next: NextFunction) {
  try {
    const sealed = await NeonRealtimeService.sealPipelineQuery();
    res.json({
      success: true,
      data: sealed,
    });
  } catch (error) {
    next(error);
  }
}
