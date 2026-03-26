import prisma from '../lib/prisma.js';
import { sendKookerAutoValidatedToAdmins } from '../lib/email.js';

/**
 * Tente l'auto-validation d'un kooker si toutes les conditions sont remplies :
 * - bio non vide
 * - city non vide
 * - specialties avec au moins 1 élément
 * - type avec au moins 1 élément
 * - stripeOnboardingComplete === true
 * - active === false (pas déjà validé)
 */
export async function tryAutoValidateKooker(kookerProfileId: number): Promise<boolean> {
  const profile = await prisma.kookerProfile.findUnique({
    where: { id: kookerProfileId },
    select: {
      bio: true,
      city: true,
      specialties: true,
      type: true,
      stripeOnboardingComplete: true,
      active: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!profile) return false;

  // Already active — nothing to do
  if (profile.active) return false;

  // Check all conditions
  if (!profile.bio || profile.bio.trim().length === 0) return false;
  if (!profile.city || profile.city.trim().length === 0) return false;
  if (!Array.isArray(profile.specialties) || profile.specialties.length === 0) return false;
  if (!Array.isArray(profile.type) || (profile.type as string[]).length === 0) return false;
  if (!profile.stripeOnboardingComplete) return false;

  // All conditions met — auto-validate
  await prisma.kookerProfile.update({
    where: { id: kookerProfileId },
    data: { active: true, verified: true },
  });

  const kookerName = `${profile.user.firstName} ${profile.user.lastName}`;
  console.log(`[auto-validate] Kooker "${kookerName}" (#${kookerProfileId}) auto-validated`);

  // Notify admins (fire and forget)
  sendKookerAutoValidatedToAdmins(kookerName, kookerProfileId).catch((err) => {
    console.error('[auto-validate] Failed to notify admins:', err);
  });

  return true;
}
