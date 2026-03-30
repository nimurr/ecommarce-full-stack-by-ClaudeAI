import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File upload middleware using express-fileupload
export const fileUpload = (options = {}) => {
  return {
    create: {
      limits: {
        fileSize: config.maxFileSize,
      },
      abortOnLimit: true,
      responseOnLimit: 'File size limit exceeded',
      useTempFiles: true,
      tempFileDir: path.join(__dirname, '../../temp'),
      ...options,
    },
  };
};

// Check file type (images only)
export const checkFileType = (file, cb) => {
  const allowedTypes = config.allowedFileTypes;
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only image files are allowed (JPEG, PNG, WEBP)'));
  }
  
  cb(null, true);
};

// Multiple file upload handler
export const uploadMultipleFiles = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one file',
    });
  }

  const files = req.files.file;
  
  // Check if single file or multiple
  const fileArray = Array.isArray(files) ? files : [files];
  
  req.filesArray = fileArray;
  next();
};
