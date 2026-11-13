
const cloudinary = require("../config/cloudinary");
const crypto = require("crypto");

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("No file buffer received."));
    }

    const isImage = file.mimetype.startsWith("image/");
    const resourceType = isImage ? "image" : "raw";

    const extension = file.originalname
      .split(".")
      .pop()
      .toLowerCase();

    const publicId = `document-${Date.now()}-${crypto.randomUUID()}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "clientlocker/private-documents",
        resource_type: resourceType,
        type: "authenticated",
        public_id: publicId,
        format: extension
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          public_id: result.public_id,
          asset_id: result.asset_id,
          resource_type: result.resource_type,
          format: result.format,
          bytes: result.bytes
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

// Generate a signed URL for backend-controlled file delivery.
// Do not store this URL in MongoDB or expose it as a permanent URL.
const generatePrivateDownloadUrl = (file, expiresInSeconds = 600) => {
  if (!file || !file.storage_path || !file.cloudinary_resource_type) {
    throw new Error("Valid stored file information is required.");
  }

  if (!Number.isInteger(expiresInSeconds) ||
      expiresInSeconds < 1 ||
      expiresInSeconds > 600) {
    throw new Error("Download URL expiry must be between 1 and 600 seconds.");
  }

  const extension = file.file_type.toLowerCase() === "jpg"
    ? "jpg"
    : file.file_type.toLowerCase();

  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  return cloudinary.utils.private_download_url(
    file.storage_path,
    extension,
    {
      resource_type: file.cloudinary_resource_type,
      type: "authenticated",
      expires_at: expiresAt,
      attachment: false
    }
  );
};

module.exports = {
  uploadToCloudinary,
  generatePrivateDownloadUrl
};
