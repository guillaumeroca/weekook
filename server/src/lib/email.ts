import { Resend } from 'resend';
import { env } from '../config/env.js';

// Initialisation lazy — ne pas créer le client si pas de clé API
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

// Cooldown en mémoire : userId → timestamp dernier email envoyé
const emailCooldown = new Map<number, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export async function sendNewMessageNotification(
  receiverId: number,
  receiverEmail: string,
  receiverName: string,
  senderName: string,
  messagePreview: string
): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const lastSent = emailCooldown.get(receiverId);
  if (lastSent && Date.now() - lastSent < COOLDOWN_MS) return;

  emailCooldown.set(receiverId, Date.now());

  const preview = messagePreview.length > 120
    ? messagePreview.substring(0, 120) + '...'
    : messagePreview;

  try {
    await resend.emails.send({
      from: 'Weekook <notifications@weekook.com>',
      to: receiverEmail,
      subject: `Nouveau message de ${senderName} sur Weekook`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f2f4fc; padding: 32px 16px;">
          <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: #c1a0fd; border-radius: 50%; width: 48px; height: 48px; line-height: 48px; text-align: center; font-size: 24px;">💬</div>
            </div>
            <h2 style="color: #111125; font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">
              Nouveau message de ${senderName}
            </h2>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0;">
              Bonjour ${receiverName}, vous avez reçu un nouveau message sur Weekook.
            </p>
            <div style="background: #f3ecff; border-left: 4px solid #c1a0fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #111125; font-size: 15px; margin: 0; font-style: italic;">"${preview}"</p>
            </div>
            <a href="${env.APP_URL}/messages" style="display: block; text-align: center; background: #c1a0fd; color: white; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 15px;">
              Répondre au message
            </a>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
              Weekook — La cuisine à domicile réinventée
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    // Email failure ne doit pas impacter la réponse API
    console.error('[email] Failed to send notification:', err);
  }
}
