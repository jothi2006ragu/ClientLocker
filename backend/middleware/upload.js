
const multer = require("multer");
const path = require("path");

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const allowedMimeTypes = {
  "application/pdf": {
    extensions: [".pdf"],
    type: "PDF"
  },
  "image/jpeg": {
    extensions: [".jpg", ".jpeg"],
    type: "JPG"
  },
  "image/png": {
    extensions: [".png"],
    type: "PNG"
  }
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowed = allowedMimeTypes[file.mimetype];

  if (!allowed) {
    const error = new Error("Only PDF, JPG and PNG files are allowed.");
    error.statusCode = 400;
    return callback(error);
  }

  if (!allowed.extensions.includes(extension)) {
    const error = new Error("File extension does not match its file type.");
    error.statusCode = 400;
    return callback(error);
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

// Validate the actual file signature after Multer receives the buffer.
const validateFileSignature = (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({
      success: false,
      message: "Please select a file to upload."
    });
  }

  const buffer = req.file.buffer;
  const mimeType = req.file.mimetype;

  const signatures = {
    "application/pdf": () =>
      buffer.length >= 5 &&
      buffer.subarray(0, 5).toString("ascii") === "%PDF-",

    "image/jpeg": () =>
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,

    "image/png": () =>
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      )
  };

  const validate = signatures[mimeType];

  if (!validate || !validate()) {
    return res.status(400).json({
      success: false,
      message: "The file contents do not match the selected file type."
    });
  }

  next();
};

// Preserve the normal Multer API: upload.single(), upload.array(), etc.
upload.validateFileSignature = validateFileSignature;

module.exports = upload;
