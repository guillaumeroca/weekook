import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireKooker } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createServiceSchema, updateServiceSchema } from '../schemas/service.js';
import { NotFoundError, ForbiddenError, AppError } from '../utils/errors.js';

const router = Router();

// GET /kooker/:id - Get all services for a kooker profile
router.get('/kooker/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kookerProfileId = parseInt(req.params.id, 10);
    if (isNaN(kookerProfileId)) {
      throw new AppError('ID invalide', 400);
    }

    const services = await prisma.service.findMany({
      where: { kookerProfileId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        menuItems: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
});

// GET /:id - Get single service
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError('ID invalide', 400);
    }

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        menuItems: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!service) {
      throw new NotFoundError('Service non trouve');
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
});

// POST / - Create service
router.post(
  '/',
  authenticate,
  requireKooker,
  validate(createServiceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kookerProfileId = req.user!.kookerProfileId!;
      const {
        title,
        description,
        type,
        priceInCents,
        durationMinutes,
        minGuests,
        maxGuests,
        allergens,
        constraints,
        specialty,
        prepTimeMinutes,
        ingredientsIncluded,
        equipmentProvided,
        menuItems,
      } = req.body;

      const service = await prisma.service.create({
        data: {
          kookerProfileId,
          title,
          description,
          type,
          priceInCents,
          durationMinutes,
          minGuests: minGuests ?? null,
          maxGuests,
          allergens: allergens || null,
          constraints: constraints || null,
          specialty: specialty || null,
          prepTimeMinutes: prepTimeMinutes ?? null,
          ingredientsIncluded: ingredientsIncluded ?? false,
          equipmentProvided: equipmentProvided ?? false,
          menuItems: menuItems
            ? {
                create: menuItems.map(
                  (item: { category: string; name: string; description?: string }, index: number) => ({
                    category: item.category,
                    name: item.name,
                    description: item.description,
                    sortOrder: index,
                  })
                ),
              }
            : undefined,
        },
      });

      // After creating the service, associate images if provided
      const { images } = req.body;
      if (images && Array.isArray(images) && images.length > 0) {
        await prisma.serviceImage.createMany({
          data: images.map((url: string, index: number) => ({
            serviceId: service.id,
            url,
            alt: title || '',
            sortOrder: index,
          })),
        });
      }

      // Re-fetch with images included
      const serviceWithImages = await prisma.service.findUnique({
        where: { id: service.id },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          menuItems: { orderBy: { sortOrder: 'asc' } },
        },
      });

      res.status(201).json({
        success: true,
        data: serviceWithImages,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /:id - Update service
router.put(
  '/:id',
  authenticate,
  requireKooker,
  validate(updateServiceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('ID invalide', 400);
      }

      const kookerProfileId = req.user!.kookerProfileId!;

      // Verify ownership
      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Service non trouve');
      }
      if (existing.kookerProfileId !== kookerProfileId) {
        throw new ForbiddenError('Vous ne pouvez modifier que vos propres services');
      }

      const {
        title,
        description,
        type,
        priceInCents,
        durationMinutes,
        minGuests,
        maxGuests,
        active,
        allergens,
        constraints,
        specialty,
        prepTimeMinutes,
        ingredientsIncluded,
        equipmentProvided,
        menuItems,
      } = req.body;

      const data: Record<string, unknown> = {};
      if (title !== undefined) data.title = title;
      if (description !== undefined) data.description = description;
      if (type !== undefined) data.type = type;
      if (priceInCents !== undefined) data.priceInCents = priceInCents;
      if (durationMinutes !== undefined) data.durationMinutes = durationMinutes;
      if (minGuests !== undefined) data.minGuests = minGuests;
      if (maxGuests !== undefined) data.maxGuests = maxGuests;
      if (active !== undefined) data.active = active;
      if (allergens !== undefined) data.allergens = allergens;
      if (constraints !== undefined) data.constraints = constraints;
      if (specialty !== undefined) data.specialty = specialty;
      if (prepTimeMinutes !== undefined) data.prepTimeMinutes = prepTimeMinutes;
      if (ingredientsIncluded !== undefined) data.ingredientsIncluded = ingredientsIncluded;
      if (equipmentProvided !== undefined) data.equipmentProvided = equipmentProvided;

      // If menuItems provided, replace all
      if (menuItems !== undefined) {
        await prisma.menuItem.deleteMany({ where: { serviceId: id } });
        if (menuItems.length > 0) {
          await prisma.menuItem.createMany({
            data: menuItems.map(
              (item: { category: string; name: string; description?: string }, index: number) => ({
                serviceId: id,
                category: item.category,
                name: item.name,
                description: item.description,
                sortOrder: index,
              })
            ),
          });
        }
      }

      // If images provided, replace all
      const { images } = req.body;
      if (images !== undefined) {
        await prisma.serviceImage.deleteMany({ where: { serviceId: id } });
        if (Array.isArray(images) && images.length > 0) {
          await prisma.serviceImage.createMany({
            data: images.map((url: string, index: number) => ({
              serviceId: id,
              url,
              alt: data.title as string || existing.title || '',
              sortOrder: index,
            })),
          });
        }
      }

      const updated = await prisma.service.update({
        where: { id },
        data,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          menuItems: { orderBy: { sortOrder: 'asc' } },
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

// DELETE /:id - Delete service
router.delete(
  '/:id',
  authenticate,
  requireKooker,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('ID invalide', 400);
      }

      const kookerProfileId = req.user!.kookerProfileId!;

      // Verify ownership
      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Service non trouve');
      }
      if (existing.kookerProfileId !== kookerProfileId) {
        throw new ForbiddenError('Vous ne pouvez supprimer que vos propres services');
      }

      await prisma.service.delete({ where: { id } });

      res.json({
        success: true,
        data: { message: 'Service supprime avec succes' },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
