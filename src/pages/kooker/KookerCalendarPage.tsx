import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users, Euro, MapPin, Settings } from 'lucide-react';
import { bookingsAPI, Booking } from '../../api/bookings';
import { mealAvailabilitiesAPI, CalendarDay, MealType, MEAL_TYPE_ORDER } from '../../api/mealAvailabilities';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateToString, getFirstDayOfMonth, getLastDayOfMonth } from '../../utils/dateUtils';

const KookerCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [weeklyMealSettings, setWeeklyMealSettings] = useState<any>({});
  const [dayMealSettings, setDayMealSettings] = useState<any>({});
  const [profileMissing, setProfileMissing] = useState(false);

  const kookerId = user?.isKooker ? user.id : null;

  useEffect(() => {
    const loadData = async () => {
      if (!kookerId) return;

      try {
        // Charger les réservations
        const bookingsResponse = await bookingsAPI.getKookerBookings(kookerId);
        if (bookingsResponse.success && bookingsResponse.bookings) {
          setBookings(bookingsResponse.bookings);
        }

        // Charger les paramètres hebdomadaires
        console.log('🔍 Chargement des paramètres hebdomadaires pour kookerId:', kookerId);
        const weeklyResponse = await mealAvailabilitiesAPI.getWeeklySettings(kookerId);
        console.log('📅 Réponse paramètres hebdomadaires:', weeklyResponse);
        if (weeklyResponse.success && weeklyResponse.weeklySettings) {
          console.log('✅ Paramètres hebdomadaires chargés:', weeklyResponse.weeklySettings);
          setWeeklyMealSettings(weeklyResponse.weeklySettings);
        } else {
          console.log('❌ Pas de paramètres hebdomadaires trouvés');
        }

        // Charger les disponibilités mensuelles
        console.log('🔍 Chargement des disponibilités mensuelles du', getFirstDayOfMonth(currentDate), 'au', getLastDayOfMonth(currentDate));
        const monthlyResponse = await mealAvailabilitiesAPI.getMealAvailabilities(
          kookerId,
          getFirstDayOfMonth(currentDate),
          getLastDayOfMonth(currentDate)
        );
        console.log('📆 Réponse disponibilités mensuelles:', monthlyResponse);

        if (monthlyResponse.success && monthlyResponse.mealAvailabilities) {
          const availabilitiesMap: any = {};
          monthlyResponse.mealAvailabilities.forEach(availability => {
            const dateStr = formatDateToString(availability.date);
            if (!availabilitiesMap[dateStr]) {
              availabilitiesMap[dateStr] = {};
            }
            availabilitiesMap[dateStr][availability.mealType] = {
              isAvailable: availability.isAvailable,
              status: availability.status,
              notes: availability.notes
            };
          });
          console.log('✅ Disponibilités mensuelles mappées:', availabilitiesMap);
          setDayMealSettings(availabilitiesMap);
        } else {
          console.log('❌ Pas de disponibilités mensuelles trouvées');
          // Si pas de données trouvées et que c'est une erreur de profil manquant
          if (monthlyResponse.message && monthlyResponse.message.includes('Profil Kooker non trouvé')) {
            console.log('⚠️ KookerProfile manquant détecté');
            setProfileMissing(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [kookerId, currentDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Jours du mois précédent pour compléter la première semaine
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(year, month, -i);
      days.push({ date: prevDay, isCurrentMonth: false });
    }

    // Jours du mois courant
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const nextDay = new Date(year, month + 1, day);
      days.push({ date: nextDay, isCurrentMonth: false });
    }

    return days;
  };

  const getBookingsForDate = (date: Date) => {
    const dateString = formatDateToString(date);
    return bookings.filter(booking => booking.date.startsWith(dateString));
  };

  const getDayAvailableMeals = (date: Date) => {
    const dateKey = formatDateToString(date);
    const dayMeals = dayMealSettings[dateKey] || {};
    const dayOfWeek = date.getDay();
    const weeklySettings = weeklyMealSettings[dayOfWeek] || {};

    // Debug: log pour samedi (6) et dimanche (0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log(`🔍 Checking availability for ${dayOfWeek === 0 ? 'Dimanche' : 'Samedi'} ${dateKey}:`);
      console.log('  dayMeals:', dayMeals);
      console.log('  weeklySettings:', weeklySettings);
    }

    const available = MEAL_TYPE_ORDER.filter(mealType => {
      const dayMeal = dayMeals[mealType];
      const weeklyMeal = weeklySettings[mealType];

      if (dayMeal) {
        const result = dayMeal.isAvailable && dayMeal.status === 'AVAILABLE';
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          console.log(`    ${mealType} (day specific): isAvailable=${dayMeal.isAvailable}, status=${dayMeal.status} → ${result}`);
        }
        return result;
      }

      const result = weeklyMeal?.isActive || false;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log(`    ${mealType} (weekly): isActive=${weeklyMeal?.isActive} → ${result}`);
      }
      return result;
    });

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log(`  ✅ Available meals for ${dayOfWeek === 0 ? 'Dimanche' : 'Samedi'}:`, available);
    }

    return available;
  };

  const hasAvailableMeals = (date: Date) => {
    const availableMeals = getDayAvailableMeals(date);
    const hasAvailable = availableMeals.length > 0;

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log(`🎯 ${dayOfWeek === 0 ? 'Dimanche' : 'Samedi'} ${formatDateToString(date)} has available meals: ${hasAvailable}`);
    }

    return hasAvailable;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_KOOKER_VALIDATION':
        return 'bg-orange-500';
      case 'PENDING_PAYMENT':
        return 'bg-blue-500';
      case 'CONFIRMED':
        return 'bg-green-500';
      case 'CANCELLED':
        return 'bg-red-500';
      case 'COMPLETED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const dayBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

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

  if (profileMissing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <Calendar className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profil Kooker à configurer</h2>
          <p className="text-gray-600 mb-6">
            Votre profil Kooker n'est pas encore configuré. Vous devez d'abord terminer la configuration
            de votre profil pour pouvoir gérer vos disponibilités et afficher votre calendrier.
          </p>
          <Link
            to="/kooker-meal-availability"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurer mon profil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Agenda</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/kooker-meal-availability"
              className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Gérer mes disponibilités
            </Link>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendrier */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-2">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold capitalize">
                  {formatMonthYear(currentDate)}
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

              <div className="grid grid-cols-7 gap-px mb-1">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(day => (
                  <div key={day} className="py-0.5 text-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px">
                {getDaysInMonth(currentDate).map(({ date, isCurrentMonth }, index) => {
                  const dayBookings = getBookingsForDate(date);
                  const isSelected = selectedDate &&
                    date.toDateString() === selectedDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        px-0.5 py-1 h-8 flex items-center justify-center text-xs transition-colors border relative
                        ${isCurrentMonth
                          ? 'bg-white hover:bg-gray-50 border-gray-200'
                          : 'bg-gray-50 text-gray-300 hover:bg-gray-100 border-gray-200'
                        }
                        ${isSelected ? 'ring-1 ring-primary' : ''}
                        ${isToday && !isSelected ? 'ring-1 ring-blue-500' : ''}
                        ${isCurrentMonth && hasAvailableMeals(date) ? 'border-green-500 border-2' : ''}
                      `}
                    >
                      <span className={`
                        ${isToday ? 'font-bold' : ''}
                        ${isCurrentMonth && hasAvailableMeals(date)
                          ? 'w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold'
                          : ''
                        }
                      `}>
                        {date.getDate()}
                      </span>
                      {dayBookings.length > 0 && (
                        <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Détails du jour sélectionné */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-2">
              <h3 className="text-base font-semibold mb-2">
                {selectedDate ? (
                  selectedDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })
                ) : (
                  'Sélectionnez une date'
                )}
              </h3>

              {selectedDate && (
                <div className="space-y-4">
                  {dayBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucune réservation</p>
                    </div>
                  ) : (
                    dayBookings.map(booking => (
                      <div
                        key={booking.id}
                        className={`p-4 rounded-lg border-l-4 ${getStatusColor(booking.status).replace('bg-', 'border-')}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">
                            {booking.user ?
                              `${booking.user.firstName} ${booking.user.lastName}` :
                              'Client'
                            }
                          </h4>
                          <span className="text-sm text-gray-500">{booking.time}</span>
                        </div>

                        {booking.specialtyCard && (
                          <p className="text-sm text-gray-600 mb-2">
                            {booking.specialtyCard.name}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {booking.guestCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="w-3 h-3" />
                            {booking.totalPrice}€
                          </div>
                        </div>

                        {booking.notes && (
                          <p className="text-xs text-gray-500 mt-2">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Légende */}
            <div className="bg-white rounded-lg shadow-md p-2 mt-2">
              <h3 className="text-base font-semibold mb-2">Légende</h3>

              {/* Couleurs des jours */}
              <div className="mb-2">
                <h4 className="font-medium mb-1 text-sm text-gray-700">Code couleur des repas</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-sm">Repas disponibles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                    <span className="text-sm">Certains repas réservés</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                    <span className="text-sm">Tous les repas disponibles sont réservés</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded flex items-center justify-center">
                      <span className="text-xs text-red-600">×</span>
                    </div>
                    <span className="text-sm">Aucune disponibilité configurée</span>
                  </div>
                </div>
              </div>

              {/* Statuts des réservations */}
              <div>
                <h4 className="font-medium mb-1 text-sm text-gray-700">Statuts des réservations</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">À valider</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">En attente de paiement</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Confirmée</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Annulée</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Terminée</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KookerCalendarPage;