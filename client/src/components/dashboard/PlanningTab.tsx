import { useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Availability {
  id: number;
  kookerProfileId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface PlanningTabProps {
  availabilities: Availability[];
  availabilitiesLoading: boolean;
  onSaved: () => Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// 3 créneaux par jour
const DEFAULT_SLOTS = [
  { startTime: '08:00', endTime: '12:00' },
  { startTime: '13:00', endTime: '17:00' },
  { startTime: '18:00', endTime: '22:00' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isPast(year: number, month: number, day: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(year, month, day) < today;
}

function isToday(year: number, month: number, day: number) {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
}

function firstWeekday(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Lun=0 … Dim=6
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M12 4L4 12M4 4L12 12" stroke="#111125" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function CheckIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.3333 4L6 11.3333L2.66667 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function CrossIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M12 4L4 12M4 4L12 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L4.667 14H2v-2.667L11.333 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  );
}

// Pastille "réservé" = vert avec petit point rouge
function DotBooked() {
  return (
    <div className="relative w-5 h-5">
      <div className="w-5 h-5 rounded-full bg-green-500" />
      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
    </div>
  );
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function Legend({ compact = false }: { compact?: boolean }) {
  const gap = compact ? 'gap-4' : 'gap-6';
  const text = compact ? 'text-[12px]' : 'text-[13px]';
  return (
    <div className={`flex items-center justify-center flex-wrap ${gap}`}>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
        <span className={`${text} text-[#5c5c6f]`}>Au moins 1 créneau disponible</span>
      </div>
      <div className="flex items-center gap-2">
        <DotBooked />
        <span className={`${text} text-[#5c5c6f]`}>Créneau réservé</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-[#d1d5db] flex-shrink-0" />
        <span className={`${text} text-[#5c5c6f]`}>Aucun créneau disponible</span>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function PlanningTab({ availabilities, availabilitiesLoading, onSaved }: PlanningTabProps) {
  // ── View calendar state
  const [viewMonth, setViewMonth] = useState(() => new Date());

  // ── Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editMonth, setEditMonth] = useState(() => new Date());
  const [editDays, setEditDays] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // ── Confirm modals state
  const [showConfirmAvail, setShowConfirmAvail] = useState(false);
  const [showConfirmUnavail, setShowConfirmUnavail] = useState(false);

  // ── Derive set of available dates from API data
  const apiAvailableDates = useMemo(() => {
    const set = new Set<string>();
    availabilities.forEach(a => {
      if (a.isAvailable) {
        // Normalize ISO datetime → YYYY-MM-DD
        set.add(String(a.date).substring(0, 10));
      }
    });
    return set;
  }, [availabilities]);

  // ── Open edit modal: initialize editDays from current API data
  const openEdit = useCallback(() => {
    setEditDays(new Set(apiAvailableDates));
    setEditMonth(new Date());
    setShowEdit(true);
  }, [apiAvailableDates]);

  // ── Toggle a day in edit modal
  const toggleDay = (key: string) => {
    setEditDays(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Mark all future days of editMonth as available
  const doMarkAllAvailable = () => {
    const y = editMonth.getFullYear();
    const m = editMonth.getMonth();
    const total = daysInMonth(y, m);
    setEditDays(prev => {
      const next = new Set(prev);
      for (let d = 1; d <= total; d++) {
        if (!isPast(y, m, d)) next.add(dateKey(y, m, d));
      }
      return next;
    });
    setShowConfirmAvail(false);
  };

  // ── Mark all future days of editMonth as unavailable
  const doMarkAllUnavailable = () => {
    const y = editMonth.getFullYear();
    const m = editMonth.getMonth();
    const total = daysInMonth(y, m);
    setEditDays(prev => {
      const next = new Set(prev);
      for (let d = 1; d <= total; d++) {
        if (!isPast(y, m, d)) next.delete(dateKey(y, m, d));
      }
      return next;
    });
    setShowConfirmUnavail(false);
  };

  // ── Save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const slots: { date: string; startTime: string; endTime: string; isAvailable: boolean }[] = [];
      editDays.forEach(dateStr => {
        DEFAULT_SLOTS.forEach(slot => {
          slots.push({ date: dateStr, ...slot, isAvailable: true });
        });
      });
      await api.put('/availability', { availabilities: slots });
      setShowEdit(false);
      await onSaved();
      toast.success('Disponibilités mises à jour !');
    } catch (err: any) {
      toast.error(err?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Derived values for view calendar
  const viewY = viewMonth.getFullYear();
  const viewM = viewMonth.getMonth();
  const viewFirstWd = firstWeekday(viewY, viewM);
  const viewDays = daysInMonth(viewY, viewM);

  // ── Derived values for edit calendar
  const editY = editMonth.getFullYear();
  const editM = editMonth.getMonth();
  const editFirstWd = firstWeekday(editY, editM);
  const editDaysTotal = daysInMonth(editY, editM);

  // ─────────────────────────────────────────────────────────────────────────

  if (availabilitiesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <SpinnerIcon />
        <p className="text-[13px] text-[#111125]/50 mt-3">Chargement du planning...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ════════════════════ VUE PRINCIPALE ════════════════════ */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[18px] md:text-[20px] font-semibold text-[#111125]">
            Mon planning de disponibilités
          </h3>
          <button
            onClick={openEdit}
            className="flex items-center gap-2 px-4 md:px-5 h-[44px] bg-[#c1a0fd] hover:bg-[#b090ed] text-white text-[13px] md:text-[14px] font-semibold rounded-[12px] transition-all flex-shrink-0"
          >
            <EditIcon />
            <span className="hidden sm:inline">Modifier les disponibilités</span>
            <span className="sm:hidden">Modifier</span>
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setViewMonth(new Date(viewY, viewM - 1))}
            className="w-10 h-10 rounded-full border border-[#c1a0fd] flex items-center justify-center text-[#c1a0fd] hover:bg-[#f3ecff] transition-colors flex-shrink-0"
          >
            <ChevronLeft />
          </button>
          <h4 className="text-[22px] md:text-[28px] font-semibold text-[#111125]">
            {MONTHS_FR[viewM]} {viewY}
          </h4>
          <button
            onClick={() => setViewMonth(new Date(viewY, viewM + 1))}
            className="w-10 h-10 rounded-full border border-[#c1a0fd] flex items-center justify-center text-[#c1a0fd] hover:bg-[#f3ecff] transition-colors flex-shrink-0"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Legend */}
        <div className="mb-6">
          <Legend />
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#e0e2ef] pb-2 mb-1">
          {DAYS_FR.map(d => (
            <div key={d} className="text-center text-[13px] md:text-[14px] font-bold text-[#111125]">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells */}
          {Array.from({ length: viewFirstWd }, (_, i) => (
            <div key={`ev-${i}`} className="h-[72px] border-b border-[#e0e2ef]/50" />
          ))}

          {/* Day cells */}
          {Array.from({ length: viewDays }, (_, i) => {
            const day = i + 1;
            const past = isPast(viewY, viewM, day);
            const tod = isToday(viewY, viewM, day);
            const key = dateKey(viewY, viewM, day);
            const available = apiAvailableDates.has(key);

            return (
              <div
                key={day}
                className="h-[72px] border-b border-[#e0e2ef]/50 flex flex-col items-center justify-center gap-1.5"
              >
                <span
                  className={`text-[14px] md:text-[15px] font-medium leading-none ${
                    past
                      ? 'text-[#111125]/30'
                      : tod
                      ? 'text-[#c1a0fd] font-bold'
                      : 'text-[#111125]'
                  }`}
                >
                  {day}
                </span>
                {available ? (
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                ) : (
                  <div className={`w-4 h-4 rounded-full ${past ? 'bg-[#e5e7eb]' : 'bg-[#d1d5db]'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Info box */}
        <div className="mt-6 p-4 bg-[#eef2ff] border border-[#c1a0fd]/30 rounded-[12px]">
          <p className="text-[12px] text-[#5c5c6f] leading-relaxed">
            📅 Vue mensuelle synthétique : Naviguez entre les mois avec les flèches. Pastille verte = au moins 1 créneau disponible. Pastille rouge = créneau réservé. Survolez une pastille pour voir le détail des créneaux. Cliquez sur "Modifier les disponibilités" pour gérer votre planning en détail.
          </p>
        </div>
      </div>

      {/* ════════════════════ MODAL ÉDITION ════════════════════ */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[680px] max-h-[90vh] overflow-y-auto shadow-xl">

            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
              <div>
                <h2 className="text-[22px] md:text-[26px] font-bold text-[#111125]">
                  Gérer mes disponibilités
                </h2>
                <p className="text-[13px] text-[#5c5c6f] mt-1.5 leading-relaxed">
                  Cliquez sur un jour pour définir vos créneaux de disponibilité. Les jours passés ne peuvent pas être modifiés.
                </p>
              </div>
              <button
                onClick={() => setShowEdit(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ml-4 mt-0.5 flex-shrink-0"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="px-6 pb-6">
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 py-3 bg-[#f8f9fb] rounded-[12px] mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-[13px] text-[#5c5c6f]">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <DotBooked />
                  <span className="text-[13px] text-[#5c5c6f]">Réservé</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#d1d5db] flex-shrink-0" />
                  <span className="text-[13px] text-[#5c5c6f]">Indisponible</span>
                </div>
              </div>

              {/* Edit month navigation */}
              <div className="flex items-center justify-center gap-5 mb-5">
                <button
                  onClick={() => setEditMonth(new Date(editY, editM - 1))}
                  className="w-10 h-10 rounded-full border border-[#c1a0fd] flex items-center justify-center text-[#c1a0fd] hover:bg-[#f3ecff] transition-colors flex-shrink-0"
                >
                  <ChevronLeft />
                </button>
                <h4 className="text-[20px] md:text-[24px] font-semibold text-[#111125]">
                  {MONTHS_FR[editM]} {editY}
                </h4>
                <button
                  onClick={() => setEditMonth(new Date(editY, editM + 1))}
                  className="w-10 h-10 rounded-full border border-[#c1a0fd] flex items-center justify-center text-[#c1a0fd] hover:bg-[#f3ecff] transition-colors flex-shrink-0"
                >
                  <ChevronRight />
                </button>
              </div>

              {/* Bulk action buttons */}
              <div className="flex gap-3 mb-5">
                <button
                  onClick={() => setShowConfirmAvail(true)}
                  className="flex-1 flex items-center justify-center gap-2 h-[44px] border-2 border-green-500 text-green-600 font-semibold text-[13px] rounded-[12px] hover:bg-green-50 transition-colors cursor-pointer"
                >
                  <CheckIcon color="#16a34a" />
                  Tout marquer disponible
                </button>
                <button
                  onClick={() => setShowConfirmUnavail(true)}
                  className="flex-1 flex items-center justify-center gap-2 h-[44px] border-2 border-red-400 text-red-500 font-semibold text-[13px] rounded-[12px] hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <CrossIcon color="#ef4444" />
                  Tout marquer indisponible
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_FR.map(d => (
                  <div key={d} className="text-center text-[12px] font-semibold text-[#5c5c6f] py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Edit calendar grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty cells */}
                {Array.from({ length: editFirstWd }, (_, i) => (
                  <div key={`ee-${i}`} />
                ))}

                {/* Day cards */}
                {Array.from({ length: editDaysTotal }, (_, i) => {
                  const day = i + 1;
                  const past = isPast(editY, editM, day);
                  const key = dateKey(editY, editM, day);
                  const available = editDays.has(key);

                  return (
                    <button
                      key={day}
                      disabled={past}
                      onClick={() => toggleDay(key)}
                      className={`aspect-square rounded-[10px] flex items-center justify-center text-[14px] font-medium border-2 transition-all ${
                        past
                          ? 'bg-[#f8f9fb] border-[#e5e7eb] text-[#111125]/25 cursor-not-allowed'
                          : available
                          ? 'bg-green-50 border-green-400 text-green-700 hover:bg-green-100 cursor-pointer'
                          : 'bg-white border-[#e0e2ef] text-[#111125] hover:border-[#c1a0fd]/50 hover:bg-[#faf9ff] cursor-pointer'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 h-[48px] bg-[#c1a0fd] hover:bg-[#b090ed] disabled:opacity-60 text-white font-semibold text-[15px] rounded-[12px] transition-all cursor-pointer"
              >
                {isSaving ? <SpinnerIcon /> : <CheckIcon color="white" />}
                Je valide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ CONFIRM : TOUT DISPONIBLE ════════════════════ */}
      {showConfirmAvail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[500px] shadow-xl p-8">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-[22px] font-bold text-[#111125]">Tout marquer disponible</h2>
              <button
                onClick={() => setShowConfirmAvail(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ml-4 flex-shrink-0"
              >
                <CloseIcon />
              </button>
            </div>
            <p className="text-[14px] text-[#5c5c6f] mb-5">
              Marquer tous les jours du mois comme disponibles (tous les créneaux)
            </p>
            <div className="bg-green-50 border border-green-200 rounded-[12px] p-4 mb-6">
              <p className="text-[13px] font-semibold text-[#111125] mb-3">Cette action va :</p>
              <ul className="space-y-2">
                {[
                  <>Marquer tous les jours du mois <strong>{MONTHS_FR[editM]} {editY}</strong> comme disponibles</>,
                  'Ajouter les 3 créneaux (Matin, Après-midi, Soir) à chaque jour',
                  'Les jours passés ne seront pas modifiés',
                  'Les créneaux déjà réservés seront préservés',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[13px] text-[#5c5c6f]">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmAvail(false)}
                className="flex-1 h-[52px] border-2 border-[#e0e2ef] text-[#111125] font-semibold rounded-[12px] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={doMarkAllAvailable}
                className="flex-1 h-[52px] bg-green-500 hover:bg-green-600 text-white font-semibold rounded-[12px] transition-colors cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ CONFIRM : TOUT INDISPONIBLE ════════════════════ */}
      {showConfirmUnavail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-[20px] w-full max-w-[500px] shadow-xl p-8">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-[22px] font-bold text-[#111125]">Tout marquer indisponible</h2>
              <button
                onClick={() => setShowConfirmUnavail(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ml-4 flex-shrink-0"
              >
                <CloseIcon />
              </button>
            </div>
            <p className="text-[14px] text-[#5c5c6f] mb-5">
              Retirer toutes les disponibilités du mois
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-[12px] p-4 mb-6">
              <p className="text-[13px] font-semibold text-[#111125] mb-3">Cette action va :</p>
              <ul className="space-y-2">
                {[
                  { icon: '⚠️', text: <><span>Retirer toutes les disponibilités du mois </span><strong>{MONTHS_FR[editM]} {editY}</strong></> },
                  { icon: '⚠️', text: 'Les nouveaux clients ne pourront pas réserver' },
                  { icon: '✓', text: 'Les jours passés ne seront pas modifiés' },
                  { icon: '✓', text: 'Les créneaux déjà réservés seront préservés' },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[13px] text-[#5c5c6f]">
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmUnavail(false)}
                className="flex-1 h-[52px] border-2 border-[#e0e2ef] text-[#111125] font-semibold rounded-[12px] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={doMarkAllUnavailable}
                className="flex-1 h-[52px] bg-red-500 hover:bg-red-600 text-white font-semibold rounded-[12px] transition-colors cursor-pointer"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
