import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadProfilePicture(
    file: Express.Multer.File,
    facultyId: number,
  ): Promise<string> {
    // validate file type
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, JPEG and PNG files are allowed');
    }

    // validate file size — max 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 2MB');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'fis/profile-pictures',
          public_id: `faculty_${facultyId}`,
          overwrite: true, // replace existing photo
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(new BadRequestException('Upload failed'));
          resolve(result!.secure_url);
        },
      );

      // convert buffer to stream and pipe to cloudinary
      const readable = new Readable();
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async deleteProfilePicture(facultyId: number): Promise<void> {
    await cloudinary.uploader.destroy(
      `fis/profile-pictures/faculty_${facultyId}`,
    );
  }
}
