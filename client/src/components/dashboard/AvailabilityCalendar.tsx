import { useState, useMemo, useCallback } from 'react';

interface Availability {
  id: number;
  kookerProfileId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// ─── Types ──────────────────────────────────────────────────────────────────────

interface AvailabilityCalendarProps {
  /** Availability slots from the API */
  availabilities: Availability[];
  /** 'view' for KookerProfilePage (read-only), 'edit' for KookerDashboardPage */
  mode: 'view' | 'edit';
  /** Callback when availabilities change in edit mode */
  onAvailabilitiesChange?: (availabilities: AvailabilitySlot[]) => void;
  /** Whether the component is saving data */
  isSaving?: boolean;
}

export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_FULL_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MONTHS_FR = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
];

const TIME_SLOTS = [
  { label: 'Matin', startTime: '08:00', endTime: '12:00', icon: 'sunrise' },
  { label: 'Midi', startTime: '12:00', endTime: '14:00', icon: 'sun' },
  { label: 'Aprem', startTime: '14:00', endTime: '18:00', icon: 'sunset' },
  { label: 'Soir', startTime: '18:00', endTime: '22:00', icon: 'moon' },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(date);
  check.setHours(0, 0, 0, 0);
  return check < today;
}

// ─── Icons ──────────────────────────────────────────────────────────────────────

function ChevronLeftIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function SunriseIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3m0 0l-3-2m3 2l3-2M4.22 10.22l1.42 1.42M1 16h3m16 0h3m-4.64-4.36l1.42-1.42M12 12a4 4 0 00-4 4H4m16 0h-4a4 4 0 00-4-4m0 0V5" />
    </svg>
  );
}

function SunIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function SunsetIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7V2m0 5l-3 2m3-2l3 2M4.22 10.22l1.42 1.42M1 16h3m16 0h3m-4.64-4.36l1.42-1.42M12 12a4 4 0 00-4 4H4m16 0h-4a4 4 0 00-4-4" />
    </svg>
  );
}

function MoonIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const SLOT_ICONS: Record<string, React.FC<{ className?: string }>> = {
  sunrise: SunriseIcon,
  sun: SunIcon,
  sunset: SunsetIcon,
  moon: MoonIcon,
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function AvailabilityCalendar({
  availabilities,
  mode,
  onAvailabilitiesChange,
  isSaving = false,
}: AvailabilityCalendarProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(today));

  // Build a lookup map: dateKey -> set of slot labels that are available
  const availabilityMap = useMemo(() => {
    const map = new Map<string, Set<string>>();

    for (const avail of availabilities) {
      if (!avail.isAvailable) continue;

      const dateKey = avail.date.split('T')[0];

      if (!map.has(dateKey)) {
        map.set(dateKey, new Set());
      }

      const slotSet = map.get(dateKey)!;

      // Match this availability's time range against our predefined slots
      for (const slot of TIME_SLOTS) {
        // Check overlap: availability covers at least part of the slot
        if (avail.startTime < slot.endTime && avail.endTime > slot.startTime) {
          slotSet.add(slot.label);
        }
      }
    }

    return map;
  }, [availabilities]);

  // Local edit state (only used in edit mode)
  const [editMap, setEditMap] = useState<Map<string, Set<string>>>(() => {
    // Initialize from existing availabilities
    const map = new Map<string, Set<string>>();
    for (const avail of availabilities) {
      if (!avail.isAvailable) continue;
      const dateKey = avail.date.split('T')[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, new Set());
      }
      const slotSet = map.get(dateKey)!;
      for (const slot of TIME_SLOTS) {
        if (avail.startTime < slot.endTime && avail.endTime > slot.startTime) {
          slotSet.add(slot.label);
        }
      }
    }
    return map;
  });

  // The active map depends on mode
  const activeMap = mode === 'edit' ? editMap : availabilityMap;

  // Week days for current view
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Navigation
  const goToPrevWeek = useCallback(() => {
    setWeekStart((prev) => {
      const newStart = addDays(prev, -7);
      const minDate = getMonday(today);
      return newStart < minDate ? minDate : newStart;
    });
  }, [today]);

  const goToNextWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, 7));
  }, []);

  const goToToday = useCallback(() => {
    setWeekStart(getMonday(today));
  }, [today]);

  const canGoPrev = weekStart > getMonday(today);

  // Toggle a slot in edit mode
  const toggleSlot = useCallback(
    (dateKey: string, slotLabel: string) => {
      if (mode !== 'edit') return;

      // Don't allow editing past dates
      const date = new Date(dateKey + 'T00:00:00');
      if (isPast(date)) return;

      setEditMap((prev) => {
        const next = new Map(prev);
        const slotSet = new Set(next.get(dateKey) || []);

        if (slotSet.has(slotLabel)) {
          slotSet.delete(slotLabel);
        } else {
          slotSet.add(slotLabel);
        }

        if (slotSet.size === 0) {
          next.delete(dateKey);
        } else {
          next.set(dateKey, slotSet);
        }

        // Notify parent of changes
        if (onAvailabilitiesChange) {
          const slots: AvailabilitySlot[] = [];
          for (const [dk, labels] of next) {
            for (const label of labels) {
              const timeSlot = TIME_SLOTS.find((s) => s.label === label);
              if (timeSlot) {
                slots.push({
                  date: dk,
                  startTime: timeSlot.startTime,
                  endTime: timeSlot.endTime,
                  isAvailable: true,
                });
              }
            }
          }
          onAvailabilitiesChange(slots);
        }

        return next;
      });
    },
    [mode, onAvailabilitiesChange]
  );

  // Check if a slot is available
  const isSlotAvailable = useCallback(
    (dateKey: string, slotLabel: string): boolean => {
      return activeMap.get(dateKey)?.has(slotLabel) ?? false;
    },
    [activeMap]
  );

  // Count total available slots for the displayed week
  const weekSlotCount = useMemo(() => {
    let count = 0;
    for (const day of weekDays) {
      const dateKey = formatDateKey(day);
      const slots = activeMap.get(dateKey);
      if (slots) count += slots.size;
    }
    return count;
  }, [weekDays, activeMap]);

  // Week label
  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${MONTHS_FR[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${MONTHS_FR[start.getMonth()]} - ${end.getDate()} ${MONTHS_FR[end.getMonth()]} ${end.getFullYear()}`;
  }, [weekDays]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            disabled={!canGoPrev}
            className={`w-[36px] h-[36px] md:w-[40px] md:h-[40px] flex items-center justify-center rounded-[10px] border transition-all duration-200 ${
              canGoPrev
                ? 'border-[#e5e7eb] bg-white text-[#111125] hover:border-[#c1a0fd] hover:text-[#c1a0fd] cursor-pointer'
                : 'border-[#f0f0f0] bg-[#f8f9fc] text-[#d1d5db] cursor-not-allowed'
            }`}
            aria-label="Semaine precedente"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          <button
            onClick={goToToday}
            className="px-3 py-1.5 md:px-4 md:py-2 text-[12px] md:text-[13px] font-medium text-[#c1a0fd] border border-[#c1a0fd] rounded-[10px] hover:bg-[#c1a0fd] hover:text-white transition-all duration-200"
          >
            Auj.
          </button>

          <button
            onClick={goToNextWeek}
            className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] flex items-center justify-center rounded-[10px] border border-[#e5e7eb] bg-white text-[#111125] hover:border-[#c1a0fd] hover:text-[#c1a0fd] transition-all duration-200 cursor-pointer"
            aria-label="Semaine suivante"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Week label + slot count */}
        <div className="flex flex-col items-start sm:items-end gap-0.5">
          <span className="text-[14px] md:text-[16px] font-semibold text-[#111125]">
            {weekLabel}
          </span>
          <span className="text-[12px] text-[#6b7280]">
            {weekSlotCount} {weekSlotCount <= 1 ? 'creneau disponible' : 'creneaux disponibles'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-[3px] bg-[#c1a0fd]" />
          <span className="text-[11px] md:text-[12px] text-[#6b7280]">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-[3px] bg-[#f0f0f5]" />
          <span className="text-[11px] md:text-[12px] text-[#6b7280]">Indisponible</span>
        </div>
        {mode === 'edit' && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-[3px] bg-[#e5e7eb] opacity-50" />
            <span className="text-[11px] md:text-[12px] text-[#6b7280]">Passe</span>
          </div>
        )}
      </div>

      {/* Calendar Grid - Desktop */}
      <div className="hidden md:block">
        <div className="bg-white rounded-[20px] border border-[#e5e7eb] overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-[#e5e7eb]">
            <div className="p-3 bg-[#f8f9fc]" />
            {weekDays.map((day, i) => {
              const dayIsToday = isToday(day);
              const dayIsPast = isPast(day);
              return (
                <div
                  key={i}
                  className={`p-3 text-center border-l border-[#e5e7eb] ${
                    dayIsToday ? 'bg-[#f5f0ff]' : dayIsPast ? 'bg-[#fafafa]' : 'bg-[#f8f9fc]'
                  }`}
                >
                  <div
                    className={`text-[11px] font-medium uppercase tracking-wider ${
                      dayIsToday ? 'text-[#c1a0fd]' : dayIsPast ? 'text-[#d1d5db]' : 'text-[#6b7280]'
                    }`}
                  >
                    {DAYS_FR[i]}
                  </div>
                  <div
                    className={`text-[18px] font-bold mt-0.5 ${
                      dayIsToday
                        ? 'text-[#c1a0fd]'
                        : dayIsPast
                        ? 'text-[#d1d5db]'
                        : 'text-[#111125]'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  {dayIsToday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c1a0fd] mx-auto mt-1" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Time slot rows */}
          {TIME_SLOTS.map((slot) => {
            const IconComp = SLOT_ICONS[slot.icon];
            return (
              <div
                key={slot.label}
                className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-[#e5e7eb] last:border-b-0"
              >
                {/* Row label */}
                <div className="p-3 flex flex-col items-center justify-center bg-[#f8f9fc] gap-1">
                  {IconComp && <IconComp className="w-4 h-4 text-[#9ca3af]" />}
                  <span className="text-[11px] font-medium text-[#6b7280]">{slot.label}</span>
                  <span className="text-[10px] text-[#9ca3af]">
                    {slot.startTime}-{slot.endTime}
                  </span>
                </div>

                {/* Day cells */}
                {weekDays.map((day, dayIndex) => {
                  const dateKey = formatDateKey(day);
                  const available = isSlotAvailable(dateKey, slot.label);
                  const dayIsPast = isPast(day);
                  const isEditable = mode === 'edit' && !dayIsPast;

                  return (
                    <div
                      key={dayIndex}
                      className="border-l border-[#e5e7eb] p-2 flex items-center justify-center"
                    >
                      <button
                        onClick={() => isEditable && toggleSlot(dateKey, slot.label)}
                        disabled={!isEditable && mode === 'edit'}
                        className={`w-full h-[48px] rounded-[10px] flex items-center justify-center transition-all duration-200 ${
                          dayIsPast
                            ? 'bg-[#f5f5f8] cursor-not-allowed'
                            : available
                            ? 'bg-[#c1a0fd] shadow-sm'
                            : 'bg-[#f0f0f5]'
                        } ${
                          isEditable && !available
                            ? 'hover:bg-[#ede7fb] hover:border-[#c1a0fd] border border-transparent cursor-pointer'
                            : ''
                        } ${
                          isEditable && available
                            ? 'hover:bg-[#b090ed] cursor-pointer'
                            : ''
                        } ${
                          mode === 'view' ? 'cursor-default' : ''
                        }`}
                        aria-label={`${DAYS_FULL_FR[dayIndex]} ${day.getDate()} ${MONTHS_FR[day.getMonth()]} - ${slot.label} : ${
                          available ? 'Disponible' : 'Indisponible'
                        }`}
                      >
                        {available && !dayIsPast && (
                          <CheckIcon className="w-5 h-5 text-white" />
                        )}
                        {dayIsPast && (
                          <span className="text-[10px] text-[#d1d5db]">-</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid - Mobile (stacked cards per day) */}
      <div className="md:hidden space-y-3">
        {weekDays.map((day, dayIndex) => {
          const dateKey = formatDateKey(day);
          const dayIsToday = isToday(day);
          const dayIsPast = isPast(day);
          const daySlots = activeMap.get(dateKey);
          const daySlotCount = daySlots?.size ?? 0;

          return (
            <div
              key={dayIndex}
              className={`rounded-[16px] border overflow-hidden transition-all duration-200 ${
                dayIsToday
                  ? 'border-[#c1a0fd] bg-white shadow-sm'
                  : dayIsPast
                  ? 'border-[#f0f0f0] bg-[#fafafa]'
                  : 'border-[#e5e7eb] bg-white'
              }`}
            >
              {/* Day header */}
              <div
                className={`flex items-center justify-between px-4 py-3 ${
                  dayIsToday ? 'bg-[#f5f0ff]' : dayIsPast ? 'bg-[#f8f8fa]' : 'bg-[#f8f9fc]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[13px] font-semibold ${
                      dayIsToday ? 'text-[#c1a0fd]' : dayIsPast ? 'text-[#d1d5db]' : 'text-[#111125]'
                    }`}
                  >
                    {DAYS_FULL_FR[dayIndex]}
                  </span>
                  <span
                    className={`text-[13px] ${
                      dayIsToday ? 'text-[#c1a0fd]' : dayIsPast ? 'text-[#d1d5db]' : 'text-[#6b7280]'
                    }`}
                  >
                    {day.getDate()} {MONTHS_FR[day.getMonth()]}
                  </span>
                  {dayIsToday && (
                    <span className="px-2 py-0.5 bg-[#c1a0fd] text-white text-[10px] font-bold rounded-full uppercase">
                      Aujourd'hui
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#9ca3af]">
                  {daySlotCount}/{TIME_SLOTS.length}
                </span>
              </div>

              {/* Slots grid */}
              <div className="grid grid-cols-4 gap-2 p-3">
                {TIME_SLOTS.map((slot) => {
                  const available = isSlotAvailable(dateKey, slot.label);
                  const isEditable = mode === 'edit' && !dayIsPast;
                  const IconComp = SLOT_ICONS[slot.icon];

                  return (
                    <button
                      key={slot.label}
                      onClick={() => isEditable && toggleSlot(dateKey, slot.label)}
                      disabled={!isEditable && mode === 'edit'}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-[10px] transition-all duration-200 ${
                        dayIsPast
                          ? 'bg-[#f5f5f8] cursor-not-allowed'
                          : available
                          ? 'bg-[#c1a0fd] text-white shadow-sm'
                          : 'bg-[#f0f0f5] text-[#6b7280]'
                      } ${
                        isEditable && !available
                          ? 'hover:bg-[#ede7fb] active:bg-[#ede7fb] cursor-pointer'
                          : ''
                      } ${
                        isEditable && available
                          ? 'hover:bg-[#b090ed] active:bg-[#b090ed] cursor-pointer'
                          : ''
                      } ${
                        mode === 'view' ? 'cursor-default' : ''
                      }`}
                      aria-label={`${slot.label} ${slot.startTime}-${slot.endTime} : ${
                        available ? 'Disponible' : 'Indisponible'
                      }`}
                    >
                      {IconComp && (
                        <IconComp
                          className={`w-4 h-4 ${
                            dayIsPast
                              ? 'text-[#d1d5db]'
                              : available
                              ? 'text-white'
                              : 'text-[#9ca3af]'
                          }`}
                        />
                      )}
                      <span
                        className={`text-[11px] font-medium ${
                          dayIsPast ? 'text-[#d1d5db]' : available ? 'text-white' : ''
                        }`}
                      >
                        {slot.label}
                      </span>
                      <span
                        className={`text-[9px] ${
                          dayIsPast
                            ? 'text-[#d1d5db]'
                            : available
                            ? 'text-white/70'
                            : 'text-[#9ca3af]'
                        }`}
                      >
                        {slot.startTime}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit mode saving indicator */}
      {mode === 'edit' && isSaving && (
        <div className="flex items-center justify-center gap-2 mt-4 py-3 bg-[#f5f0ff] rounded-[12px]">
          <div className="w-4 h-4 border-2 border-[#c1a0fd] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-[#7c5cbf] font-medium">Sauvegarde en cours...</span>
        </div>
      )}

      {/* Edit mode hint */}
      {mode === 'edit' && !isSaving && (
        <p className="text-[12px] text-[#9ca3af] mt-3 text-center">
          Cliquez sur un creneau pour activer ou desactiver votre disponibilite
        </p>
      )}

      {/* View mode - no slots message */}
      {mode === 'view' && weekSlotCount === 0 && (
        <div className="flex flex-col items-center justify-center py-8 mt-4 bg-[#f8f9fc] rounded-[16px]">
          <div className="w-[48px] h-[48px] mb-3 rounded-full bg-[#f0f0f5] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-[#6b7280]">
            Aucune disponibilite cette semaine
          </p>
          <p className="text-[12px] text-[#9ca3af] mt-1">
            Essayez de consulter la semaine suivante
          </p>
        </div>
      )}
    </div>
  );
}
