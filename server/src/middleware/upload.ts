import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req: AuthenticatedRequest, file, cb) => {
    if (!req.user?.id) return cb(new Error('User ID missing'), '');
    const uploadPath = path.join(__dirname, '..', 'uploads', req.user.id);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
