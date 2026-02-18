import { z } from 'zod';

export const createReviewSchema = z.object({
  kookerProfileId: z.number({ required_error: 'kookerProfileId est requis' }),
  rating: z.number().min(1, 'La note minimum est 1').max(5, 'La note maximum est 5'),
  comment: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
