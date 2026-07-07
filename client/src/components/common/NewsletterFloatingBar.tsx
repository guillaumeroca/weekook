import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEY = 'weekook_newsletter_dismissed';

export function NewsletterFloatingBar() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  if (user || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: brancher sur l'API newsletter
    setStatus('success');
    setTimeout(handleDismiss, 2500);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e6e6f0] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] animate-slide-up">
      <div className="px-10 py-3 flex flex-col sm:flex-row items-center justify-center gap-3">

        {status === 'success' ? (
          <p className="text-center text-[14px] font-semibold text-[#303044]">
            Merci ! Vous êtes bien inscrit à notre newsletter.
          </p>
        ) : (
          <>
            <p className="text-[13px] md:text-[14px] text-[#303044] font-medium shrink-0">
              Recevoir notre Newsletter
            </p>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center h-[40px] bg-[#f3ecff] rounded-[8px] overflow-hidden w-full sm:w-[320px]">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="flex-1 bg-transparent pl-[14px] text-[13px] text-[#111125] placeholder:text-[#828294] outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#c1a0fd] h-full px-[16px] font-semibold text-[13px] text-[#111125] hover:bg-[#b090ed] transition-colors shrink-0"
                >
                  S'inscrire
                </button>
              </div>
            </form>
          </>
        )}

        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#828294] hover:text-[#303044] transition-colors p-1"
          aria-label="Fermer"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
