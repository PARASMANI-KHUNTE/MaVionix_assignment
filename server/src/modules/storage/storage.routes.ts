import { Router } from 'express';
import { uploadFile, listFiles, getFile, deleteFile } from './storage.controller.js';

const router = Router();

router.post('/upload', uploadFile);
router.get('/files', listFiles);
router.get('/files/:key(*)', getFile);
router.delete('/files/:key(*)', deleteFile);

export default router;
