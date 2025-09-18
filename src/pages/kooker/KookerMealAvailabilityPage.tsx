import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Save, Coffee, Utensils, Cookie, Moon, Edit3, Check } from 'lucide-react';
import {
  mealAvailabilitiesAPI,
  MealAvailability,
  MealType,
  MealStatus,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ORDER
} from '../../api/mealAvailabilities';
import { toast } from 'sonner';
import { formatDateToString, getFirstDayOfMonth, getLastDayOfMonth } from '../../utils/dateUtils';

interface WeeklyMealSettings {
  [dayOfWeek: number]: {
    [mealType in MealType]: {
      isActive: boolean;
      startTime: string;
      endTime: string;
    };
  };
}

interface DayMealSettings {
  [key: string]: {
    [mealType in MealType]: {
      isAvailable: boolean;
      status: MealStatus;
      notes?: string;
    };
  };
}

interface ModalData {
  date: Date;
  dateKey: string;
  dayMeals: {
    [mealType in MealType]?: {
      isAvailable: boolean;
      status: MealStatus;
      notes?: string;
    };
  };
}

const DAYS_OF_WEEK = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const KookerMealAvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weeklySettings, setWeeklySettings] = useState<WeeklyMealSettings>({});
  const [dayMealSettings, setDayMealSettings] = useState<DayMealSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const getMealIcon = (mealType: MealType) => {
    switch (mealType) {
      case 'BREAKFAST':
        return <Coffee className="w-4 h-4" />;
      case 'LUNCH':
        return <Utensils className="w-4 h-4" />;
      case 'SNACK':
        return <Cookie className="w-4 h-4" />;
      case 'DINNER':
        return <Moon className="w-4 h-4" />;
      default:
        return <Utensils className="w-4 h-4" />;
    }
  };

  // Initialiser les paramètres hebdomadaires par défaut
  const initializeWeeklySettings = async () => {
    if (!user?.id) return;

    try {
      // Essayer de charger les paramètres sauvegardés
      const response = await mealAvailabilitiesAPI.getWeeklySettings(user.id);

      if (response.success && response.weeklySettings && Object.keys(response.weeklySettings).length > 0) {
        // Utiliser les paramètres sauvegardés
        setWeeklySettings(response.weeklySettings);
        console.log('Paramètres hebdomadaires chargés depuis la sauvegarde');
      } else {
        // Utiliser les paramètres par défaut
        const defaultSettings: WeeklyMealSettings = {};

        for (let day = 0; day < 7; day++) {
          defaultSettings[day] = {
            BREAKFAST: { isActive: true, startTime: '07:00', endTime: '10:00' },
            LUNCH: { isActive: true, startTime: '12:00', endTime: '14:00' },
            SNACK: { isActive: true, startTime: '16:00', endTime: '18:00' },
            DINNER: { isActive: true, startTime: '19:00', endTime: '22:00' }
          };
        }

        setWeeklySettings(defaultSettings);
        console.log('Paramètres hebdomadaires initialisés avec les valeurs par défaut');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);

      // En cas d'erreur, utiliser les paramètres par défaut
      const defaultSettings: WeeklyMealSettings = {};

      for (let day = 0; day < 7; day++) {
        defaultSettings[day] = {
          BREAKFAST: { isActive: true, startTime: '07:00', endTime: '10:00' },
          LUNCH: { isActive: true, startTime: '12:00', endTime: '14:00' },
          SNACK: { isActive: true, startTime: '16:00', endTime: '18:00' },
          DINNER: { isActive: true, startTime: '19:00', endTime: '22:00' }
        };
      }

      setWeeklySettings(defaultSettings);
    }
  };

  const loadMealAvailabilities = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await mealAvailabilitiesAPI.getMealAvailabilities(
        user.id,
        getFirstDayOfMonth(currentDate),
        getLastDayOfMonth(currentDate)
      );

      if (response.success && response.mealAvailabilities) {
        const settings: DayMealSettings = {};

        response.mealAvailabilities.forEach((meal: MealAvailability) => {
          const dateKey = formatDateToString(meal.date);
          if (!settings[dateKey]) {
            settings[dateKey] = {} as any;
          }
          settings[dateKey][meal.mealType] = {
            isAvailable: meal.isAvailable,
            status: meal.status,
            notes: meal.notes
          };
        });

        setDayMealSettings(settings);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      toast.error('Erreur lors du chargement des disponibilités');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await initializeWeeklySettings();
      await loadMealAvailabilities();
    };

    loadData();
  }, [user?.id, currentDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(year, month, -i);
      days.push({ date: prevDay, isCurrentMonth: false });
    }

    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Jours du mois suivant
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDay = new Date(year, month + 1, day);
      days.push({ date: nextDay, isCurrentMonth: false });
    }

    return days;
  };

  const getDayColor = (date: Date) => {
    const dateKey = formatDateToString(date);
    const daySettings = dayMealSettings[dateKey];
    const dayOfWeek = date.getDay();

    // Récupérer les repas configurés pour ce jour de la semaine
    const weeklyDay = weeklySettings[dayOfWeek];
    const availableFromWeekly = weeklyDay ? MEAL_TYPE_ORDER.filter(mealType => weeklyDay[mealType]?.isActive) : [];

    // Si aucune disponibilité configurée pour ce jour
    if (availableFromWeekly.length === 0) {
      return 'bg-red-100 border-red-300';
    }

    // Si pas de paramètres spécifiques pour ce jour, utiliser la config hebdomadaire
    if (!daySettings) {
      return 'bg-green-100 border-green-300'; // Disponible selon config hebdomadaire
    }

    // Analyser les repas configurés
    const configuredMeals = availableFromWeekly.map(mealType => ({
      type: mealType,
      setting: daySettings[mealType] || { isAvailable: true, status: 'AVAILABLE' as MealStatus }
    }));

    const bookedMeals = configuredMeals.filter(meal =>
      meal.setting.status === 'BOOKED'
    );
    const blockedMeals = configuredMeals.filter(meal =>
      !meal.setting.isAvailable || meal.setting.status === 'BLOCKED'
    );

    // Logique des couleurs
    if (blockedMeals.length === configuredMeals.length) {
      return 'bg-red-100 border-red-300'; // Tous bloqués
    }
    if (bookedMeals.length === availableFromWeekly.length) {
      return 'bg-yellow-100 border-yellow-300'; // Tous réservés
    }
    if (bookedMeals.length > 0) {
      return 'bg-blue-100 border-blue-300'; // Au moins un réservé
    }

    return 'bg-green-100 border-green-300'; // Disponible
  };

  const getDayAvailableMeals = (date: Date) => {
    const dateKey = formatDateToString(date);
    const daySettings = dayMealSettings[dateKey];
    const dayOfWeek = date.getDay();

    // Récupérer les repas configurés pour ce jour de la semaine
    const weeklyDay = weeklySettings[dayOfWeek];
    const availableFromWeekly = weeklyDay ? MEAL_TYPE_ORDER.filter(mealType => weeklyDay[mealType]?.isActive) : [];

    if (availableFromWeekly.length === 0) {
      return { available: [], hasNoConfig: true };
    }

    if (!daySettings) {
      return { available: availableFromWeekly, hasNoConfig: false };
    }

    const availableMeals = availableFromWeekly.filter(mealType => {
      const setting = daySettings[mealType];
      return !setting || (setting.isAvailable && setting.status !== 'BLOCKED');
    });

    return { available: availableMeals, hasNoConfig: false };
  };

  const openDayModal = (date: Date) => {
    const dateKey = formatDateToString(date);
    const dayMeals = dayMealSettings[dateKey] || {};

    setModalData({
      date,
      dateKey,
      dayMeals
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const updateModalMeal = (mealType: MealType, field: string, value: any) => {
    if (!modalData) return;

    setModalData(prev => ({
      ...prev!,
      dayMeals: {
        ...prev!.dayMeals,
        [mealType]: {
          ...prev!.dayMeals[mealType],
          [field]: value
        }
      }
    }));
  };

  const saveDayMeals = async () => {
    if (!modalData || !user?.id) return;

    setSaving(true);
    try {
      const availabilities = MEAL_TYPE_ORDER.map(mealType => {
        const meal = modalData.dayMeals[mealType];
        return {
          date: modalData.dateKey,
          mealType,
          isAvailable: meal?.isAvailable ?? true,
          status: meal?.status ?? 'AVAILABLE' as MealStatus,
          notes: meal?.notes
        };
      });

      await mealAvailabilitiesAPI.updateDayMealAvailabilities(user.id, {
        date: modalData.dateKey,
        availabilities
      });

      // Mettre à jour l'état local
      setDayMealSettings(prev => ({
        ...prev,
        [modalData.dateKey]: Object.fromEntries(
          availabilities.map(meal => [
            meal.mealType,
            {
              isAvailable: meal.isAvailable,
              status: meal.status,
              notes: meal.notes
            }
          ])
        ) as any
      }));

      toast.success('Disponibilités sauvegardées');
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const saveWeeklySettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const result = await mealAvailabilitiesAPI.saveWeeklySettings(user.id, weeklySettings);

      if (result.success) {
        toast.success('Paramètres hebdomadaires sauvegardés');
      } else {
        toast.error(result.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleAllMealsForDay = (dayIndex: number) => {
    const currentDay = weeklySettings[dayIndex];
    const hasAllActive = MEAL_TYPE_ORDER.every(mealType => currentDay?.[mealType]?.isActive);

    setWeeklySettings(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        ...MEAL_TYPE_ORDER.reduce((dayConfig, mealType) => ({
          ...dayConfig,
          [mealType]: {
            ...prev[dayIndex]?.[mealType],
            isActive: !hasAllActive,
            startTime: prev[dayIndex]?.[mealType]?.startTime || '09:00',
            endTime: prev[dayIndex]?.[mealType]?.endTime || '22:00'
          }
        }), {} as any)
      }
    }));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  if (!user?.isKooker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Cette page est réservée aux Kookers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Disponibilités par repas</h1>
            <p className="text-gray-600 mt-2">
              Configurez vos disponibilités hebdomadaires et gérez votre agenda
            </p>
          </div>
        </div>

        {/* Configuration hebdomadaire */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Configuration hebdomadaire</h2>
            <button
              onClick={saveWeeklySettings}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {DAYS_OF_WEEK.map((dayName, dayIndex) => {
              const currentDay = weeklySettings[dayIndex];
              const hasAllActive = MEAL_TYPE_ORDER.every(mealType => currentDay?.[mealType]?.isActive);
              const hasAnyActive = MEAL_TYPE_ORDER.some(mealType => currentDay?.[mealType]?.isActive);

              return (
                <div key={dayIndex} className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{dayName}</h3>
                    <button
                      onClick={() => toggleAllMealsForDay(dayIndex)}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary transition-colors"
                      title={hasAllActive ? 'Tout désélectionner' : 'Tout sélectionner'}
                    >
                      <div className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                        ${hasAllActive
                          ? 'bg-green-500 border-green-500'
                          : hasAnyActive
                            ? 'bg-yellow-500 border-yellow-500'
                            : 'bg-gray-300 border-gray-300'
                        }
                      `}>
                        {hasAllActive && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {hasAnyActive && !hasAllActive && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span>Tous</span>
                    </button>
                  </div>

                <div className="space-y-3">
                  {MEAL_TYPE_ORDER.map(mealType => {
                    const mealConfig = weeklySettings[dayIndex]?.[mealType];
                    const isActive = mealConfig?.isActive ?? false;
                    return (
                      <div key={mealType} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getMealIcon(mealType)}
                          <span className="text-sm text-gray-700">{MEAL_TYPE_LABELS[mealType]}</span>
                        </div>
                        <label className="flex items-center relative cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => {
                              setWeeklySettings(prev => ({
                                ...prev,
                                [dayIndex]: {
                                  ...prev[dayIndex],
                                  [mealType]: {
                                    ...prev[dayIndex]?.[mealType],
                                    isActive: e.target.checked,
                                    startTime: prev[dayIndex]?.[mealType]?.startTime || '09:00',
                                    endTime: prev[dayIndex]?.[mealType]?.endTime || '22:00'
                                  }
                                }
                              }));
                            }}
                            className="sr-only"
                          />
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                            ${isActive
                              ? 'bg-green-500 border-green-500'
                              : 'bg-red-500 border-red-500'
                            }
                          `}>
                            {isActive && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Configuration rapide :</strong> Cochez les repas pour lesquels vous souhaitez être disponible par défaut.
              Vous pourrez ensuite ajuster les détails jour par jour dans le calendrier ci-dessous.
            </p>
          </div>
        </div>

        {/* Calendrier */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold capitalize">
              Agenda - {formatMonthYear(currentDate)}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map(({ date, isCurrentMonth }, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const dayInfo = getDayAvailableMeals(date);

              return (
                <button
                  key={index}
                  onClick={() => isCurrentMonth && openDayModal(date)}
                  className={`
                    min-h-[100px] p-2 rounded border transition-colors flex flex-col
                    ${isCurrentMonth
                      ? `${getDayColor(date)} hover:shadow-md cursor-pointer`
                      : 'bg-gray-50 text-gray-300 border-gray-200'
                    }
                    ${isToday && isCurrentMonth ? 'ring-2 ring-primary' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : ''}`}>
                    {date.getDate()}
                  </div>

                  {isCurrentMonth && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                      {dayInfo.hasNoConfig ? (
                        <div className="flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-red-500 border-4 border-red-800 flex items-center justify-center shadow-2xl">
                            <span className="text-white font-black text-6xl">✕</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap justify-center gap-3 p-2">
                          {dayInfo.available.map(mealType => (
                            <div key={mealType} className="bg-green-500 p-3 rounded-2xl border-4 border-green-800 shadow-2xl">
                              {React.cloneElement(getMealIcon(mealType), {
                                className: 'w-16 h-16 text-white stroke-[3] drop-shadow-2xl'
                              })}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-center bg-blue-500 rounded-full p-2 shadow-lg">
                        <Edit3 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Légende */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Légende</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Toutes disponibilités libres</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Au moins une réservée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>Partiellement disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span>Indisponible</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification journalière */}
      {isModalOpen && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Disponibilités du {modalData.date.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {MEAL_TYPE_ORDER.map(mealType => {
                const meal = modalData.dayMeals[mealType] || {
                  isAvailable: true,
                  status: 'AVAILABLE' as MealStatus,
                  notes: ''
                };

                return (
                  <div key={mealType} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      {getMealIcon(mealType)}
                      <h4 className="font-medium text-gray-900">{MEAL_TYPE_LABELS[mealType]}</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Disponibilité
                        </label>
                        <select
                          value={meal.isAvailable ? 'available' : 'blocked'}
                          onChange={(e) => updateModalMeal(mealType, 'isAvailable', e.target.value === 'available')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="available">Disponible</option>
                          <option value="blocked">Bloqué</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Statut
                        </label>
                        <select
                          value={meal.status}
                          onChange={(e) => updateModalMeal(mealType, 'status', e.target.value as MealStatus)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="AVAILABLE">Disponible</option>
                          <option value="BOOKED">Réservé</option>
                          <option value="BLOCKED">Bloqué</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (optionnel)
                      </label>
                      <textarea
                        value={meal.notes || ''}
                        onChange={(e) => updateModalMeal(mealType, 'notes', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Ajoutez une note..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveDayMeals}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KookerMealAvailabilityPage;