import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

@Injectable()
export class MediaService {
  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    }
  }

  async uploadImageFromBuffer(buffer: Buffer, options: UploadApiOptions = {}): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'devforum', resource_type: 'image', ...options },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload sem resultado'));
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
  }
}

