import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// POST /page-view — public, no auth required
router.post('/page-view', async (req: Request, res: Response) => {
  try {
    const { page, loadTimeMs, userId } = req.body;
    if (!page || typeof loadTimeMs !== 'number') {
      return res.status(400).json({ success: false, error: 'page et loadTimeMs requis' });
    }
    await prisma.pageViewLog.create({
      data: {
        page: String(page).slice(0, 100),
        loadTimeMs: Math.round(loadTimeMs),
        userId: userId ?? null,
      },
    });
    res.json({ success: true });
  } catch {
    // fire-and-forget — ne jamais faire échouer le client
    res.json({ success: true });
  }
});

export default router;
