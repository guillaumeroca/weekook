import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { AppError } from '../utils/errors.js';

const router = Router();

// POST / - Upload single file
router.post(
  '/',
  authenticate,
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('Aucun fichier fourni', 400);
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      res.status(201).json({
        success: true,
        data: {
          url: fileUrl,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
