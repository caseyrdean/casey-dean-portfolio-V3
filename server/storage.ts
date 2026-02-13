/**
 * Platform-Agnostic File Storage
 *
 * Supports two modes:
 * 1. AWS S3 (when S3_BUCKET_NAME is configured) - files stored in S3
 * 2. Database fallback (no S3) - files stored as base64 in the database
 *
 * This ensures the app works everywhere: Manus, AWS, local, any cloud.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client singleton
let s3Client: S3Client | null = null;

function isS3Configured(): boolean {
  return !!(process.env.S3_BUCKET_NAME);
}

function getS3Client(): S3Client {
  if (!s3Client) {
    const region = process.env.S3_REGION || process.env.AWS_REGION || "us-east-1";
    s3Client = new S3Client({ region });
  }
  return s3Client;
}

function getBucket(): string {
  return process.env.S3_BUCKET_NAME!;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Upload a file to S3 (when configured) or return a data URL for DB storage.
 * 
 * When S3 is not configured, returns a data URL that can be stored directly
 * in the database and served inline. This makes the app work without any
 * external storage dependency.
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  if (isS3Configured()) {
    // S3 mode: upload to bucket
    const client = getS3Client();
    const bucket = getBucket();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: typeof data === "string" ? Buffer.from(data) : data,
      ContentType: contentType,
    });

    await client.send(command);

    const region = process.env.S3_REGION || process.env.AWS_REGION || "us-east-1";
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return { key, url };
  }

  // Fallback: create a data URL for inline storage
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  const base64 = buffer.toString("base64");
  const url = `data:${contentType};base64,${base64}`;
  return { key, url };
}

/**
 * Get a URL for downloading a file.
 * With S3: returns a presigned URL.
 * Without S3: returns the stored URL directly (data URL or external URL).
 */
export async function storageGet(
  relKey: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  if (isS3Configured()) {
    const client = getS3Client();
    const bucket = getBucket();

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    return { key, url };
  }

  // Without S3, we can't retrieve by key - the URL should be stored in the DB
  return { key, url: "" };
}

/**
 * Get public URL for a file.
 * Only works with S3. Without S3, use the URL stored in the database.
 */
export function getPublicUrl(relKey: string): string {
  if (!isS3Configured()) {
    return "";
  }
  const bucket = getBucket();
  const key = normalizeKey(relKey);
  const region = process.env.S3_REGION || process.env.AWS_REGION || "us-east-1";
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Check if external file storage (S3) is available.
 * Useful for UI to show appropriate upload guidance.
 */
export function isStorageAvailable(): boolean {
  return isS3Configured();
}
