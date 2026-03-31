import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (UPLOADS_FOLDER) {
  // Create directory if it doesn't exist
  if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
    console.log('✅ Created upload directory:', UPLOADS_FOLDER);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const filename = 
        file.originalname
          .replace(fileExt, '')
          .toLocaleLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();

      cb(null, filename + fileExt);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'image/gif'
      ) {
        cb(null, true);
      } else {
        cb(new Error('Only jpg, png, jpeg, webp, gif format allowed!'));
      }
    },
  });

  return upload;
};
