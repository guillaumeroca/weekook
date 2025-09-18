/**
 * Utilitaires de gestion des dates pour assurer la cohérence à travers l'application
 * Format standard: YYYY-MM-DD (ISO date sans temps)
 */

/**
 * Normalise une date vers le format standard YYYY-MM-DD
 * @param date - Date object, string ISO, ou string YYYY-MM-DD
 * @returns string au format YYYY-MM-DD
 */
export const formatDateToString = (date: Date | string): string => {
  if (typeof date === 'string') {
    // Si c'est déjà un string, extraire la partie date
    return date.includes('T') ? date.split('T')[0] : date;
  }

  // Si c'est un objet Date, convertir vers YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

/**
 * Parse une date string vers un objet Date
 * @param dateString - String au format YYYY-MM-DD ou ISO
 * @returns Date object
 */
export const parseStringToDate = (dateString: string): Date => {
  // Assurer qu'on utilise le format YYYY-MM-DD
  const normalizedString = formatDateToString(dateString);
  return new Date(normalizedString + 'T00:00:00.000Z');
};

/**
 * Obtient la date d'aujourd'hui au format YYYY-MM-DD
 * @returns string au format YYYY-MM-DD
 */
export const getTodayString = (): string => {
  return formatDateToString(new Date());
};

/**
 * Obtient le premier jour du mois au format YYYY-MM-DD
 * @param date - Date de référence
 * @returns string au format YYYY-MM-DD
 */
export const getFirstDayOfMonth = (date: Date): string => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return formatDateToString(firstDay);
};

/**
 * Obtient le dernier jour du mois au format YYYY-MM-DD
 * @param date - Date de référence
 * @returns string au format YYYY-MM-DD
 */
export const getLastDayOfMonth = (date: Date): string => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return formatDateToString(lastDay);
};

/**
 * Compare deux dates au format string
 * @param date1 - Première date (string ou Date)
 * @param date2 - Deuxième date (string ou Date)
 * @returns true si les dates sont identiques
 */
export const isSameDate = (date1: Date | string, date2: Date | string): boolean => {
  return formatDateToString(date1) === formatDateToString(date2);
};