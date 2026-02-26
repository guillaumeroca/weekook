import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateUserProfileSchema } from '../schemas/kooker.js';

const router = Router();

// PUT /profile - Update user profile
router.put(
  '/profile',
  authenticate,
  validate(updateUserProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { firstName, lastName, phone } = req.body;

      const data: Record<string, unknown> = {};
      if (firstName !== undefined) data.firstName = firstName;
      if (lastName !== undefined) data.lastName = lastName;
      if (phone !== undefined) data.phone = phone;

      const updated = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /avatar - Update user avatar URL
router.put(
  '/avatar',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { avatar } = req.body;

      if (!avatar || typeof avatar !== 'string') {
        return res.status(400).json({
          success: false,
          error: "L'URL de l'avatar est requise",
        });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { avatar },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
