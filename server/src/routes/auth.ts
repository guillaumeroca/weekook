import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { signToken, INACTIVITY_TIMEOUT_MS } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.js';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';
import { sendPasswordResetEmail } from '../lib/email.js';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: INACTIVITY_TIMEOUT_MS, // 2h inactivity timeout
  path: '/',
};

// POST /register
router.post(
  '/register',
  rateLimit(50, 15 * 60 * 1000),
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
  rateLimit(50, 15 * 60 * 1000),
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

// POST /forgot-password
router.post(
  '/forgot-password',
  rateLimit(5, 15 * 60 * 1000),
  validate(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });

      // Toujours répondre success pour éviter l'énumération d'emails
      if (!user) {
        return res.json({ success: true, data: { message: 'Si cet email existe, un lien vous a été envoyé.' } });
      }

      // Supprimer les anciens tokens de cet utilisateur
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

      // Créer un nouveau token (expire dans 1h)
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      const resetUrl = `${env.APP_URL}/reinitialiser-mot-de-passe?token=${token}`;
      await sendPasswordResetEmail(user.email, user.firstName, resetUrl);

      res.json({ success: true, data: { message: 'Si cet email existe, un lien vous a été envoyé.' } });
    } catch (error) {
      next(error);
    }
  }
);

// POST /reset-password
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;

      const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

      if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
        throw new AppError('Ce lien est invalide ou a expiré.', 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.$transaction([
        prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashedPassword } }),
        prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
      ]);

      res.json({ success: true, data: { message: 'Mot de passe réinitialisé avec succès.' } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
