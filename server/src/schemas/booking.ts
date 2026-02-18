import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.number({ required_error: 'serviceId est requis' }),
  date: z.string({ required_error: 'La date est requise' }),
  startTime: z.string({ required_error: "L'heure de debut est requise" }),
  guests: z.number().optional().default(1),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed'], {
    required_error: 'Le statut est requis',
    invalid_type_error: 'Statut invalide',
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
