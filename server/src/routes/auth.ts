import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// POST /register
router.post(
  '/register',
  rateLimit(10, 15 * 60 * 1000),
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError('Cette adresse email est déjà associée à un compte.', 409);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
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

      const token = signToken({ userId: user.id, email: user.email });
      res.cookie('token', token, COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        data: {
          ...user,
          kookerProfileId: null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /login
router.post(
  '/login',
  rateLimit(10, 15 * 60 * 1000),
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: { kookerProfile: { select: { id: true } } },
      });

      if (!user) {
        throw new AppError('Email ou mot de passe incorrect.', 401);
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new AppError('Email ou mot de passe incorrect.', 401);
      }

      const token = signToken({ userId: user.id, email: user.email });
      res.cookie('token', token, COOKIE_OPTIONS);

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt,
          kookerProfileId: user.kookerProfile?.id || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true, data: { message: 'Deconnexion reussie' } });
});

// GET /me
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { kookerProfile: { select: { id: true } } },
      });

      if (!user) {
        throw new AppError('Utilisateur non trouve', 404);
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt,
          kookerProfileId: user.kookerProfile?.id || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
