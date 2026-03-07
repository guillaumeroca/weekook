import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateUserProfileSchema, updateHostingProfileSchema } from '../schemas/kooker.js';

const router = Router();

// PUT /profile - Update user profile
router.put(
  '/profile',
  authenticate,
  validate(updateUserProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { firstName, lastName, phone, email } = req.body;

      // Check email uniqueness if email is being changed
      if (email !== undefined) {
        const existing = await prisma.user.findFirst({
          where: { email, NOT: { id: userId } },
        });
        if (existing) {
          return res.status(409).json({ success: false, error: 'Cet email est déjà utilisé par un autre compte.' });
        }
      }

      const data: Record<string, unknown> = {};
      if (firstName !== undefined) data.firstName = firstName;
      if (lastName !== undefined) data.lastName = lastName;
      if (phone !== undefined) data.phone = phone;
      if (email !== undefined) data.email = email;

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

// GET /hosting-profile - Get user hosting profile
router.get(
  '/hosting-profile',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const profile = await prisma.userProfile.findUnique({ where: { userId } });
      res.json({ success: true, data: profile ?? null });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /hosting-profile - Upsert user hosting profile
router.put(
  '/hosting-profile',
  authenticate,
  validate(updateHostingProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const {
        address, addressComplement, city, postalCode, country,
        accessCode, floor, intercom, parkingInfo,
        stoveType, hasOven, hasDishwasher, tableCapacity, kitchenNotes,
        dietaryRestrictions, allergies, hostingNotes,
      } = req.body;

      const data: Record<string, unknown> = {};
      if (address             !== undefined) data.address             = address;
      if (addressComplement   !== undefined) data.addressComplement   = addressComplement;
      if (city                !== undefined) data.city                = city;
      if (postalCode          !== undefined) data.postalCode          = postalCode;
      if (country             !== undefined) data.country             = country;
      if (accessCode          !== undefined) data.accessCode          = accessCode;
      if (floor               !== undefined) data.floor               = floor;
      if (intercom            !== undefined) data.intercom            = intercom;
      if (parkingInfo         !== undefined) data.parkingInfo         = parkingInfo;
      if (stoveType           !== undefined) data.stoveType           = stoveType;
      if (hasOven             !== undefined) data.hasOven             = hasOven;
      if (hasDishwasher       !== undefined) data.hasDishwasher       = hasDishwasher;
      if (tableCapacity       !== undefined) data.tableCapacity       = tableCapacity;
      if (kitchenNotes        !== undefined) data.kitchenNotes        = kitchenNotes;
      if (dietaryRestrictions !== undefined) data.dietaryRestrictions = dietaryRestrictions;
      if (allergies           !== undefined) data.allergies           = allergies;
      if (hostingNotes        !== undefined) data.hostingNotes        = hostingNotes;

      const profile = await prisma.userProfile.upsert({
        where:  { userId },
        update: data,
        create: { userId, ...data },
      });

      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
