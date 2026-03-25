import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer (from Multer) to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder (e.g. 'assignments', 'materials')
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export const uploadToCloudinary = (buffer, folder = 'erp') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
};

export default cloudinary;
