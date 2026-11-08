import { Request, Response, NextFunction } from 'express';
import { NeonStorageService } from './neon-storage.service.js';
import { BadRequestError } from '../../utils/errors.js';

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { key, content, contentType, base64 } = req.body;

    if (!key || typeof key !== 'string') {
      throw new BadRequestError('A valid string "key" is required');
    }

    let buffer: Buffer;
    if (base64) {
      buffer = Buffer.from(base64, 'base64');
    } else if (content !== undefined) {
      buffer = Buffer.from(typeof content === 'string' ? content : JSON.stringify(content));
    } else {
      throw new BadRequestError('Either "content" (text) or "base64" payload must be provided');
    }

    const type = contentType || 'application/octet-stream';
    const result = await NeonStorageService.uploadFile(key, buffer, type, {
      uploadedBy: 'ai-crm-system',
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'File successfully stored in Neon Object Storage',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function listFiles(req: Request, res: Response, next: NextFunction) {
  try {
    const prefix = typeof req.query.prefix === 'string' ? req.query.prefix : undefined;
    const files = await NeonStorageService.listFiles(prefix);
    res.json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFile(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.params.key;
    const { data, contentType } = await NeonStorageService.getFile(key);
    res.setHeader('Content-Type', contentType);
    res.send(data);
  } catch (error) {
    next(error);
  }
}

export async function deleteFile(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.params.key;
    await NeonStorageService.deleteFile(key);
    res.json({
      success: true,
      message: `File '${key}' deleted from Neon Object Storage`,
    });
  } catch (error) {
    next(error);
  }
}
