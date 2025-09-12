import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary';

@Injectable()
export class MediaService {
  private isConfigured = false;

  private ensureConfigured(): void {
    if (this.isConfigured) return;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials are missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    this.isConfigured = true;
  }

  async uploadImage(buffer: Buffer, filename?: string, options?: UploadApiOptions): Promise<UploadApiResponse> {
    this.ensureConfigured();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || 'devforum/avatars',
          resource_type: 'image',
          filename_override: filename,
          use_filename: Boolean(filename),
          unique_filename: !filename,
          ...options,
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Cloudinary upload failed'));
          resolve(result);
        },
      );

      uploadStream.end(buffer);
    });
  }
}

