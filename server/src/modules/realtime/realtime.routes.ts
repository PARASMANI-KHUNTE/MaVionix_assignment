import { Router } from 'express';
import { getRealtimeConfig, sealLeadsQuery, sealPipelineQuery } from './realtime.controller.js';

const router = Router();

router.get('/config', getRealtimeConfig);
router.post('/seal-leads', sealLeadsQuery);
router.post('/seal-pipeline', sealPipelineQuery);

export default router;
