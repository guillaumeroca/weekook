import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendMessageSchema } from '../schemas/message.js';
import { AppError } from '../utils/errors.js';

const router = Router();
const prisma = new PrismaClient();

// GET /conversations - Get list of conversations with last message and unread count
router.get(
  '/conversations',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;

      // Get all messages where user is sender or receiver
      const messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          receiver: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Group by conversation partner
      const conversationMap = new Map<
        number,
        {
          user: { id: number; firstName: string; lastName: string; avatar: string | null };
          lastMessage: typeof messages[0];
          unreadCount: number;
        }
      >();

      for (const msg of messages) {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            user: partner,
            lastMessage: msg,
            unreadCount: 0,
          });
        }

        // Count unread messages from this partner
        if (msg.receiverId === userId && !msg.read) {
          const conv = conversationMap.get(partnerId)!;
          conv.unreadCount += 1;
        }
      }

      const conversations = Array.from(conversationMap.values()).sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
      );

      res.json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /conversation/:userId - Get messages with specific user, mark unread as read
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

      // Get all messages between the two users
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

      // Mark unread messages from other user as read
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          read: false,
        },
        data: { read: true },
      });

      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST / - Send message
router.post(
  '/',
  authenticate,
  validate(sendMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user!.userId;
      const { receiverId, content } = req.body;

      if (senderId === receiverId) {
        throw new AppError('Vous ne pouvez pas vous envoyer un message a vous-meme', 400);
      }

      // Check receiver exists
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

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
