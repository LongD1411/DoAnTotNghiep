import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Trích public_id từ Cloudinary URL để dùng khi xóa
// URL dạng: https://res.cloudinary.com/{cloud}/image/upload/v{ver}/{folder}/{name}.{ext}
const extractPublicId = (url) => {
  const idx = url.indexOf('/upload/');
  if (idx === -1) return null;
  let path = url.slice(idx + 8);        // bỏ '/upload/'
  path = path.replace(/^v\d+\//, '');   // bỏ version prefix v123456/
  return path.replace(/\.[^/.]+$/, ''); // bỏ extension
};

export const deleteFromT3 = (url) => {
  const publicId = extractPublicId(url);
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId);
};

// Upload buffer lên Cloudinary, trả về secure URL
export const uploadToT3 = (buffer, filename, mimetype) =>
  new Promise((resolve, reject) => {
    const folder = process.env.CLOUDINARY_FOLDER || 'nha-nong';
    const publicId = filename.replace(/\.[^/.]+$/, ''); // bỏ extension

    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
