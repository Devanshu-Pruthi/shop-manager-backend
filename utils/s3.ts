import { S3Client, GetBucketLocationCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Note: dotenv is already loaded in server.ts before this module is imported

// Cache bucket region so we don't call AWS every time
let cachedBucketRegion: string | null = null;

/**
 * Auto-detects the bucket's actual region (no need to set AWS_REGION in .env)
 */
const getBucketRegion = async (bucketName: string): Promise<string> => {
    if (cachedBucketRegion) return cachedBucketRegion;

    // Use us-east-1 as the initial client — it's S3's global endpoint
    const globalClient = new S3Client({
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
    });

    const command = new GetBucketLocationCommand({ Bucket: bucketName });
    const response = await globalClient.send(command);

    // AWS returns null for us-east-1, so handle that edge case
    cachedBucketRegion = response.LocationConstraint || 'us-east-1';
    return cachedBucketRegion;
};

/**
 * Upload Base64 image to AWS S3
 * @param base64Data Base64 string of the image
 * @param fileName Name of the file in S3
 * @returns Secure URL of the uploaded image (S3 or CloudFront)
 */
export const uploadToBase64ToS3 = async (base64Data: string, fileName: string): Promise<string> => {
    if (!base64Data || !base64Data.includes('base64,')) {
        return base64Data;
    }
    const base64Content = base64Data.split(';base64,').pop();
    if (!base64Content) throw new Error('Invalid base64 data');

    const buffer = Buffer.from(base64Content, 'base64');
    const contentType = base64Data.split(';')[0].split(':')[1];

    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    const key = `customers/${Date.now()}-${fileName}`;

    // Auto-detect region instead of relying on .env
    const region = await getBucketRegion(bucketName);

    const s3Client = new S3Client({
        region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
    });

    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType
        }
    });

    await upload.done();

    // Return CloudFront URL if available, otherwise direct S3 URL
    const cloudfrontUrl = process.env.CLOUDFRONT_URL;
    if (cloudfrontUrl) {
        // Ensure https:// prefix is always present
        const baseUrl = cloudfrontUrl.startsWith('http') ? cloudfrontUrl : `https://${cloudfrontUrl}`;
        const url = `${baseUrl}/${key}`;
        return url;
    }

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    return url;
};

