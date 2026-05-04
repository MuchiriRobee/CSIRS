import multer from 'multer';

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const upload = multer({
  storage: multer.memoryStorage(),   // ← Changed to memory (important for Cloudinary)
  fileFilter: (req: any, file: any, cb: any) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP and PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});