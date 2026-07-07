import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

/**
 * Mesure le temps de chargement d'une page et l'envoie à l'API.
 * @param pageName - Nom lisible de la page (ex: "Accueil", "Recherche")
 * @param ready - Passer true quand les données sont chargées
 */
export function usePageTiming(pageName: string, ready: boolean) {
  const startRef = useRef(performance.now());
  const sentRef = useRef(false);

  useEffect(() => {
    if (ready && !sentRef.current) {
      sentRef.current = true;
      const loadTimeMs = Math.round(performance.now() - startRef.current);
      api.post('/metrics/page-view', { page: pageName, loadTimeMs }).catch(() => {});
    }
  }, [ready, pageName]);
}
