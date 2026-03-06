import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendMessageSchema } from '../schemas/message.js';
import { AppError } from '../utils/errors.js';
import { sendNewMessageNotification } from '../lib/email.js';

const router = Router();

// GET /unread-count — Nombre total de messages non lus
router.get(
  '/unread-count',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const count = await prisma.message.count({
        where: { receiverId: userId, read: false },
      });
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }
);

// GET /conversations — Liste des conversations avec dernier message et nb non lus
router.get(
  '/conversations',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      const messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
          sender: {
            select: {
              id: true, firstName: true, lastName: true, avatar: true,
              kookerProfile: { select: { id: true } },
            },
          },
          receiver: {
            select: {
              id: true, firstName: true, lastName: true, avatar: true,
              kookerProfile: { select: { id: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Group par partenaire de conversation
      const conversationMap = new Map<
        number,
        {
          user: { id: number; firstName: string; lastName: string; avatar: string | null; kookerProfileId: number | null };
          lastMessage: (typeof messages)[0];
          unreadCount: number;
          kookerRecipientId: number | null;
        }
      >();

      for (const msg of messages) {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const partnerRaw = msg.senderId === userId ? msg.receiver : msg.sender;
        const partner = {
          id: partnerRaw.id,
          firstName: partnerRaw.firstName,
          lastName: partnerRaw.lastName,
          avatar: partnerRaw.avatar,
          kookerProfileId: (partnerRaw as any).kookerProfile?.id ?? null,
        };

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            user: partner,
            lastMessage: msg,
            unreadCount: 0,
            kookerRecipientId: msg.kookerRecipientId ?? null,
          });
        } else {
          // Propager kookerRecipientId si un message de la conversation le porte
          const conv = conversationMap.get(partnerId)!;
          if (!conv.kookerRecipientId && msg.kookerRecipientId) {
            conv.kookerRecipientId = msg.kookerRecipientId;
          }
        }

        if (msg.receiverId === userId && !msg.read) {
          conversationMap.get(partnerId)!.unreadCount += 1;
        }
      }

      const conversations = Array.from(conversationMap.values()).sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
      );

      res.json({ success: true, data: conversations });
    } catch (error) {
      next(error);
    }
  }
);

// GET /conversation/:userId — Messages avec un utilisateur, marque comme lus
router.get(
  '/conversation/:userId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user!.userId;
      const otherUserId = parseInt(req.params.userId, 10);

      if (isNaN(otherUserId)) {
        throw new AppError('ID utilisateur invalide', 400);
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUserId },
          ],
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          receiver: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Marquer les messages reçus comme lus
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          read: false,
        },
        data: { read: true },
      });

      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }
);

// POST / — Envoyer un message
router.post(
  '/',
  authenticate,
  validate(sendMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user!.userId;
      const { receiverId, content, kookerRecipientId } = req.body;

      if (senderId === receiverId) {
        throw new AppError('Vous ne pouvez pas vous envoyer un message a vous-meme', 400);
      }

      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
      });

      if (!receiver) {
        throw new AppError('Destinataire non trouve', 404);
      }

      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content,
          ...(kookerRecipientId ? { kookerRecipientId } : {}),
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          receiver: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      });

      // Notification email async (ne bloque pas la réponse)
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { firstName: true, lastName: true },
      });
      const senderName = sender
        ? `${sender.firstName} ${sender.lastName}`.trim()
        : 'Un utilisateur';
      const receiverName = `${receiver.firstName} ${receiver.lastName}`.trim();

      sendNewMessageNotification(
        receiverId,
        receiver.email,
        receiverName,
        senderName,
        content
      );

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /conversation/:userId — Supprimer toute la conversation avec un utilisateur
router.delete(
  '/conversation/:userId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user!.userId;
      const otherUserId = parseInt(req.params.userId, 10);

      if (isNaN(otherUserId)) throw new AppError('ID invalide', 400);

      await prisma.message.deleteMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUserId },
          ],
        },
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /:id — Supprimer un message (expéditeur uniquement)
router.delete(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const messageId = parseInt(req.params.id, 10);

      if (isNaN(messageId)) throw new AppError('ID invalide', 400);

      const message = await prisma.message.findUnique({ where: { id: messageId } });
      if (!message) throw new AppError('Message introuvable', 404);
      if (message.senderId !== userId && message.receiverId !== userId) throw new AppError('Non autorisé', 403);

      await prisma.message.delete({ where: { id: messageId } });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
