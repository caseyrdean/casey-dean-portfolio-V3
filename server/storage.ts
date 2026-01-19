/**
 * AWS S3 Storage Helpers - Standalone Version
 *
 * Direct S3 integration without Manus proxy.
 * Requires S3_BUCKET_NAME and S3_REGION environment variables.
 * Uses AWS SDK credentials from IAM role when running on AWS infrastructure (Amplify, EC2, ECS).
 * For local development, set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your environment.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client singleton
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const region = process.env.S3_REGION || process.env.AWS_REGION || "us-east-1";
    s3Client = new S3Client({ region });
  }
  return s3Client;
}

function getBucket(): string {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("S3_BUCKET_NAME environment variable is not set");
  }
  return bucket;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Upload a file to S3
 * @param relKey - Relative path/key for the file in S3
 * @param data - File content as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const bucket = getBucket();
  const key = normalizeKey(relKey);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: typeof data === "string" ? Buffer.from(data) : data,
    ContentType: contentType,
  });

  await client.send(command);

  // Construct public URL (assumes bucket has public read access or CloudFront)
  const region = process.env.S3_REGION || process.env.AWS_REGION || "us-east-1";
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { key, url };
}

/**
 * Get a presigned URL for downloading a file from S3
 * @param relKey - Relative path/key for the file in S3
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Object with key and presigned URL
 */
export async function storageGet(
  relKey: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const bucket = getBucket();
  const key = normalizeKey(relKey);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(client, command, { expiresIn });

  return { key, url };
}

/**
 * Get public URL for a file (no presigning, assumes public bucket)
 * @param relKey - Relative path/key for the file in S3
 * @returns Public URL string
 */
export function getPublicUrl(relKey: string): string {
  const bucket = getBucket();
  const key = normalizeKey(relKey);
  const region = process.env.S3_REGION || process.env.AWS_REGION || "us-east-1";
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
