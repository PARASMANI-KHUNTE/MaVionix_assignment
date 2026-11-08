import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/errors.js';

export interface StoredFile {
  key: string;
  size: number;
  lastModified?: Date;
  contentType?: string;
  url?: string;
}

export class NeonStorageService {
  private static client: S3Client | null = null;
  public static readonly BUCKET_NAME = 'assets';

  private static getClient(): S3Client {
    if (!this.client) {
      if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_ENDPOINT_URL_S3) {
        throw new AppError('Neon Object Storage credentials or endpoint not configured', 500);
      }

      this.client = new S3Client({
        region: env.AWS_REGION || 'ap-southeast-1',
        endpoint: env.AWS_ENDPOINT_URL_S3,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
      });
    }
    return this.client;
  }

  /**
   * Upload an object into the Neon 'assets' bucket
   */
  static async uploadFile(
    key: string,
    body: Buffer | Uint8Array | string,
    contentType: string = 'application/octet-stream',
    metadata?: Record<string, string>
  ): Promise<{ key: string; bucket: string; size: number }> {
    const client = this.getClient();
    const cleanKey = key.replace(/^\/+/, '');
    const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);

    const command = new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: cleanKey,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
    });

    await client.send(command);

    return {
      key: cleanKey,
      bucket: this.BUCKET_NAME,
      size: buffer.length,
    };
  }

  /**
   * Retrieve an object from the Neon 'assets' bucket
   */
  static async getFile(key: string): Promise<{ data: Buffer; contentType: string }> {
    const client = this.getClient();
    const cleanKey = key.replace(/^\/+/, '');

    const command = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: cleanKey,
    });

    const response = await client.send(command);
    if (!response.Body) {
      throw new AppError(`Object ${cleanKey} has empty body`, 404);
    }

    const byteArray = await response.Body.transformToByteArray();
    return {
      data: Buffer.from(byteArray),
      contentType: response.ContentType || 'application/octet-stream',
    };
  }

  /**
   * List files in the Neon 'assets' bucket
   */
  static async listFiles(prefix?: string): Promise<StoredFile[]> {
    const client = this.getClient();
    const command = new ListObjectsV2Command({
      Bucket: this.BUCKET_NAME,
      Prefix: prefix || '',
    });

    const response = await client.send(command);
    if (!response.Contents) {
      return [];
    }

    return response.Contents.map((item) => ({
      key: item.Key || '',
      size: item.Size || 0,
      lastModified: item.LastModified,
      url: `${env.AWS_ENDPOINT_URL_S3}/${this.BUCKET_NAME}/${item.Key}`,
    }));
  }

  /**
   * Delete an object from the Neon 'assets' bucket
   */
  static async deleteFile(key: string): Promise<void> {
    const client = this.getClient();
    const cleanKey = key.replace(/^\/+/, '');

    const command = new DeleteObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: cleanKey,
    });

    await client.send(command);
  }

  /**
   * Health check for Neon Object Storage
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded';
    bucket: string;
    objectCount: number;
    endpoint: string;
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      const client = this.getClient();
      const res = await client.send(
        new ListObjectsV2Command({
          Bucket: this.BUCKET_NAME,
          MaxKeys: 10,
        })
      );
      return {
        status: 'healthy',
        bucket: this.BUCKET_NAME,
        objectCount: res.KeyCount ?? 0,
        endpoint: env.AWS_ENDPOINT_URL_S3 || 'configured',
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        status: 'degraded',
        bucket: this.BUCKET_NAME,
        objectCount: 0,
        endpoint: env.AWS_ENDPOINT_URL_S3 || 'unreachable',
        latencyMs: Date.now() - start,
      };
    }
  }
}
