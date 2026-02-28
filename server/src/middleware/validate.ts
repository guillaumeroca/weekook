import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      console.error('[validate] body:', JSON.stringify(req.body));
      console.error('[validate] errors:', JSON.stringify(result.error.flatten().fieldErrors));
      return res.status(400).json({
        success: false,
        error: 'Donnees invalides',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}
