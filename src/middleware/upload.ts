import multer from 'multer';

const ACCEPTED_MIME = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non accepté. Formats acceptés : images (JPEG, PNG, GIF, WEBP) et PDF'));
    }
  },
});
