import { z } from 'zod';

export const becomeKookerSchema = z.object({
  bio: z.string().optional(),
  specialties: z.array(z.string()),
  type: z.array(z.string()),
  city: z.string().min(1, 'La ville est requise'),
  experience: z.string().optional(),
});

export const updateKookerProfileSchema = z.object({
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  city: z.string().optional(),
  experience: z.string().optional(),
  address: z.string().optional(),
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export type BecomeKookerInput = z.infer<typeof becomeKookerSchema>;
export type UpdateKookerProfileInput = z.infer<typeof updateKookerProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
