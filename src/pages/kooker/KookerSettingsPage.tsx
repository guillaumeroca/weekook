import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import { ChefHat, Settings, ChevronLeft, ChevronRight, Camera, MapPin, Euro, Plus, X, Upload, Save, CheckCircle2, Coffee, Utensils, Cookie, Moon, Edit3 } from 'lucide-react';
import { format, getDay, isToday } from 'date-fns';
import { availabilitiesAPI, WeeklyAvailability, DailyAvailability, WeeklyAvailabilityInput } from '../../api/availabilities';
import {
  mealAvailabilitiesAPI,
  MealType,
  MealStatus,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ORDER
} from '../../api/mealAvailabilities';
import { toast } from 'sonner';
import { formatDateToString, getFirstDayOfMonth, getLastDayOfMonth } from '../../utils/dateUtils';

// Types for specialty card
interface SpecialtyCard {
  id: string;
  name: string;
  serviceArea: string;
  pricePerPerson: number;
  additionalInfo: string;
  requiredEquipment: string;
  photos: string[];
}

// Types for form data
interface KookerFormData {
  // Step 1: Personal Info
  profileImage?: File;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  bio: string;

  // Step 2: Culinary Experience
  experience: string;
  specialties: string[];
  certificates: string[];

  // Step 3: Services & Pricing
  serviceArea: number;
  pricePerHour: number;
  minimumDuration: number;
  maxGuests: number;

  // Step 4: Availability
  availableDays: string[];
  typicalHours: {
    start: string;
    end: string;
  };

  // Specialty Cards
  specialtyCards: SpecialtyCard[];
}

// Types for meal availability management
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

const initialFormData: KookerFormData = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  city: '',
  bio: '',
  experience: '',
  specialties: [],
  certificates: [],
  serviceArea: 20,
  pricePerHour: 35,
  minimumDuration: 2,
  maxGuests: 8,
  availableDays: [],
  typicalHours: {
    start: '09:00',
    end: '21:00'
  },
  specialtyCards: []
};

const steps = [
  {
    id: 'personal',
    title: 'Informations personnelles',
    description: 'Vos informations de base'
  },
  {
    id: 'experience',
    title: 'Expérience culinaire',
    description: 'Votre parcours et spécialités'
  },
  {
    id: 'services',
    title: 'Services & tarifs',
    description: 'Définissez vos prestations'
  },
  {
    id: 'specialties',
    title: 'Fiches spécialités',
    description: 'Créez vos offres détaillées'
  },
  {
    id: 'availability',
    title: 'Disponibilités par repas',
    description: 'Gestion hebdomadaire et mensuelle'
  }
];

const specialtiesList = [
  "Cuisine française",
  "Cuisine italienne",
  "Cuisine japonaise",
  "Cuisine méditerranéenne",
  "Cuisine végétarienne",
  "Cuisine végane",
  "Pâtisserie française",
  "Boulangerie",
  "Cuisine du monde",
  "Cuisine healthy",
  "Cuisine traditionnelle",
  "Street food"
];

const KookerSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<KookerFormData>(initialFormData);
  const [completionPercentage, setCompletionPercentage] = useState(25);
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);
  const [specialtyCards, setSpecialtyCards] = useState<SpecialtyCard[]>([]);
  const [currentSpecialty, setCurrentSpecialty] = useState<SpecialtyCard>({
    id: '',
    name: '',
    serviceArea: '',
    pricePerPerson: 0,
    additionalInfo: '',
    requiredEquipment: '',
    photos: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingProfileImage, setExistingProfileImage] = useState<string | null>(null);
  const dataLoadedRef = useRef(false);

  // États pour les disponibilités
  const [weeklyAvailabilities, setWeeklyAvailabilities] = useState<WeeklyAvailability[]>([]);
  const [dailyAvailabilities, setDailyAvailabilities] = useState<DailyAvailability[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [dayModalData, setDayModalData] = useState<{
    date: Date;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    notes: string;
  } | null>(null);

  // États pour la gestion des disponibilités par repas
  const [mealCurrentDate, setMealCurrentDate] = useState(new Date());
  const [weeklyMealSettings, setWeeklyMealSettings] = useState<WeeklyMealSettings>({});
  const [dayMealSettings, setDayMealSettings] = useState<DayMealSettings>({});
  const [mealLoading, setMealLoading] = useState(true);
  const [savingMeal, setSavingMeal] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  // Charger les données du profil Kooker
  useEffect(() => {
    let isMounted = true;

    const loadKookerProfile = async () => {
      if (!user?.id || !user.isKooker || dataLoadedRef.current) {
        if (!user?.id || !user.isKooker) {
          if (isMounted) setIsLoading(false);
        }
        return;
      }

      try {
        const result = await authAPI.getKookerProfile(user.id);

        if (!isMounted) return; // Component was unmounted

        if (result.success && result.profile) {
          const profile = result.profile;
          const userData = profile.user;

          // Mettre à jour le formulaire avec les données de la BDD
          const newFormData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            address: userData.address || '',
            city: userData.city || '',
            bio: profile.bio || '',
            experience: profile.experience || '',
            profileImage: undefined, // Pas de File object pour les images existantes
            specialties: profile.specialties || [],
            certificates: profile.certificates || [],
            serviceArea: profile.serviceArea || 20,
            pricePerHour: profile.pricePerHour || 35,
            minimumDuration: profile.minimumDuration || 2,
            maxGuests: profile.maxGuests || 8,
            availableDays: [],
            typicalHours: {
              start: '09:00',
              end: '21:00'
            },
            specialtyCards: []
          };

          console.log('Spécialités chargées depuis la BDD:', profile.specialties);
          console.log('FormData mis à jour:', newFormData.specialties);
          console.log('Specialty cards chargées depuis la BDD:', profile.specialtyCards);

          setFormData(newFormData);

          // Charger les specialty cards depuis la BDD
          if (profile.specialtyCards) {
            setSpecialtyCards(profile.specialtyCards);
          }

          // Charger l'image de profil existante
          if (profile.profileImage) {
            setExistingProfileImage(profile.profileImage);
          }

          dataLoadedRef.current = true;
        } else {
          toast.error('Erreur lors du chargement du profil');
        }
      } catch (error) {
        if (!isMounted) return; // Component was unmounted
        console.error('Erreur lors du chargement du profil Kooker:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadKookerProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.isKooker]);

  // Charger les disponibilités
  useEffect(() => {
    const loadAvailabilities = async () => {
      if (!user?.id || !user.isKooker) return;

      try {
        const result = await availabilitiesAPI.getAvailabilities(user.id);
        if (result.success && result.availabilities) {
          setWeeklyAvailabilities(result.availabilities.weekly);
          setDailyAvailabilities(result.availabilities.daily);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des disponibilités:', error);
      }
    };

    loadAvailabilities();
  }, [user?.id, user?.isKooker]);

  // Fonctions pour les disponibilités par repas
  const initializeWeeklyMealSettings = async () => {
    if (!user?.id) {
      // Initialize with default settings even if user is not available
      const defaultSettings: WeeklyMealSettings = {};
      for (let day = 0; day < 7; day++) {
        defaultSettings[day] = {
          BREAKFAST: { isActive: true, startTime: '07:00', endTime: '10:00' },
          LUNCH: { isActive: true, startTime: '12:00', endTime: '14:00' },
          SNACK: { isActive: true, startTime: '16:00', endTime: '18:00' },
          DINNER: { isActive: true, startTime: '19:00', endTime: '22:00' }
        };
      }
      setWeeklyMealSettings(defaultSettings);
      return;
    }

    try {
      const response = await mealAvailabilitiesAPI.getWeeklySettings(user.id);

      if (response.success && response.weeklySettings && Object.keys(response.weeklySettings).length > 0) {
        setWeeklyMealSettings(response.weeklySettings);
      } else {
        const defaultSettings: WeeklyMealSettings = {};

        for (let day = 0; day < 7; day++) {
          defaultSettings[day] = {
            BREAKFAST: { isActive: true, startTime: '07:00', endTime: '10:00' },
            LUNCH: { isActive: true, startTime: '12:00', endTime: '14:00' },
            SNACK: { isActive: true, startTime: '16:00', endTime: '18:00' },
            DINNER: { isActive: true, startTime: '19:00', endTime: '22:00' }
          };
        }

        setWeeklyMealSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      // Set default settings on error
      const defaultSettings: WeeklyMealSettings = {};
      for (let day = 0; day < 7; day++) {
        defaultSettings[day] = {
          BREAKFAST: { isActive: true, startTime: '07:00', endTime: '10:00' },
          LUNCH: { isActive: true, startTime: '12:00', endTime: '14:00' },
          SNACK: { isActive: true, startTime: '16:00', endTime: '18:00' },
          DINNER: { isActive: true, startTime: '19:00', endTime: '22:00' }
        };
      }
      setWeeklyMealSettings(defaultSettings);
    }
  };

  const loadMealAvailabilities = async () => {
    if (!user?.id) {
      setMealLoading(false);
      return;
    }

    setMealLoading(true);
    try {
      const response = await mealAvailabilitiesAPI.getMealAvailabilities(
        user.id,
        getFirstDayOfMonth(mealCurrentDate),
        getLastDayOfMonth(mealCurrentDate)
      );

      if (response.success && response.mealAvailabilities) {
        const availabilitiesMap: DayMealSettings = {};
        response.mealAvailabilities.forEach(availability => {
          // Normaliser la date au format YYYY-MM-DD
          const dateStr = formatDateToString(availability.date);
          if (!availabilitiesMap[dateStr]) {
            availabilitiesMap[dateStr] = {} as any;
          }
          availabilitiesMap[dateStr][availability.mealType] = {
            isAvailable: availability.isAvailable,
            status: availability.status,
            notes: availability.notes
          };
        });
        setDayMealSettings(availabilitiesMap);
      } else {
        // Initialize empty settings if no data
        setDayMealSettings({});
      }
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      // Initialize empty settings on error
      setDayMealSettings({});
    } finally {
      setMealLoading(false);
    }
  };

  // useEffect pour les disponibilités par repas
  useEffect(() => {
    const loadMealData = async () => {
      await initializeWeeklyMealSettings();
      await loadMealAvailabilities();
    };

    loadMealData();
  }, [user?.id, mealCurrentDate]);

  // Redirect if not a Kooker
  if (!user || !user.isKooker) {
    return <Navigate to="/settings" replace />;
  }

  // Afficher le loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil Kooker...</p>
        </div>
      </div>
    );
  }

  // Fonction pour sauvegarder le profil
  const saveKookerProfile = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      console.log('Sauvegarde des spécialités:', formData.specialties);

      // Convertir la photo en base64 si elle existe
      let profileImageBase64 = null;
      if (formData.profileImage) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        profileImageBase64 = await new Promise((resolve) => {
          img.onload = () => {
            // Redimensionner l'image (max 400x400)
            const maxSize = 400;
            let { width, height } = img;

            if (width > maxSize || height > maxSize) {
              const ratio = Math.min(maxSize / width, maxSize / height);
              width *= ratio;
              height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            // Convertir en Base64 avec compression
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedDataUrl);
          };

          img.src = URL.createObjectURL(formData.profileImage!);
        });
      }

      const result = await authAPI.updateKookerProfile(user.id, {
        // Champs User
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        // Champs KookerProfile
        bio: formData.bio,
        experience: formData.experience,
        profileImage: profileImageBase64 as string,
        serviceArea: formData.serviceArea,
        pricePerHour: formData.pricePerHour,
        minimumDuration: formData.minimumDuration,
        maxGuests: formData.maxGuests,
        specialties: formData.specialties,
        certificates: formData.certificates,
      });

      if (result.success) {
        toast.success('Profil Kooker sauvegardé avec succès !');
      } else {
        toast.error(result.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du profil');
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour obtenir l'icône du type de repas
  const getMealIcon = (mealType: MealType, className = "w-4 h-4") => {
    switch (mealType) {
      case 'BREAKFAST':
        return <Coffee className={className} />;
      case 'LUNCH':
        return <Utensils className={className} />;
      case 'SNACK':
        return <Cookie className={className} />;
      case 'DINNER':
        return <Moon className={className} />;
      default:
        return <Utensils className={className} />;
    }
  };

  const updateFormData = (field: keyof KookerFormData, value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Calculate completion percentage
      let completed = 0;
      const total = Object.keys(initialFormData).length;

      Object.entries(newData).forEach(([_, value]) => {
        if (Array.isArray(value) && value.length > 0) completed++;
        else if (typeof value === 'object' && value !== null) {
          if (Object.values(value).every(v => v !== '')) completed++;
        }
        else if (value) completed++;
      });

      const percentage = Math.round((completed / total) * 100);
      setCompletionPercentage(percentage);

      return newData;
    });
  };

  const handleNext = async () => {
    // Sauvegarder les données avant de passer à l'étape suivante
    await saveKookerProfile();

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    const specialties = formData.specialties.includes(specialty)
      ? formData.specialties.filter(s => s !== specialty)
      : [...formData.specialties, specialty];

    console.log('Toggle spécialité:', specialty, 'Nouvelles spécialités:', specialties);
    updateFormData('specialties', specialties);
  };


  const handleAddSpecialty = () => {
    setIsAddingSpecialty(true);
    setCurrentSpecialty({
      id: '',
      name: '',
      serviceArea: '',
      pricePerPerson: 0,
      additionalInfo: '',
      requiredEquipment: '',
      photos: []
    });
  };

  const handleSaveSpecialty = async () => {
    if (!user?.id) return;

    if (specialtyCards.length >= 5 && !currentSpecialty.id) {
      toast.error('Vous ne pouvez pas ajouter plus de 5 spécialités');
      return;
    }

    try {
      if (currentSpecialty.id && currentSpecialty.id !== '') {
        // Modifier une fiche existante (vérifier que l'ID n'est pas vide)
        const result = await authAPI.updateSpecialtyCard(currentSpecialty.id, {
          name: currentSpecialty.name,
          serviceArea: currentSpecialty.serviceArea,
          pricePerPerson: currentSpecialty.pricePerPerson,
          additionalInfo: currentSpecialty.additionalInfo,
          requiredEquipment: currentSpecialty.requiredEquipment,
          photos: currentSpecialty.photos
        });

        if (result.success) {
          setSpecialtyCards(prev =>
            prev.map(card =>
              card.id === currentSpecialty.id ? result.specialtyCard : card
            )
          );
          toast.success('Fiche spécialité mise à jour avec succès !');
        } else {
          toast.error(result.message || 'Erreur lors de la mise à jour');
        }
      } else {
        // Créer une nouvelle fiche
        const result = await authAPI.createSpecialtyCard(user.id, {
          name: currentSpecialty.name,
          serviceArea: currentSpecialty.serviceArea,
          pricePerPerson: currentSpecialty.pricePerPerson,
          additionalInfo: currentSpecialty.additionalInfo,
          requiredEquipment: currentSpecialty.requiredEquipment,
          photos: currentSpecialty.photos
        });

        if (result.success) {
          setSpecialtyCards(prev => [...prev, result.specialtyCard]);
          toast.success('Fiche spécialité créée avec succès !');
        } else {
          toast.error(result.message || 'Erreur lors de la création');
        }
      }

      setIsAddingSpecialty(false);
      setCurrentSpecialty({
        id: '',
        name: '',
        serviceArea: '',
        pricePerPerson: 0,
        additionalInfo: '',
        requiredEquipment: '',
        photos: []
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la fiche spécialité:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteSpecialty = async (id: string) => {
    try {
      const result = await authAPI.deleteSpecialtyCard(id);

      if (result.success) {
        setSpecialtyCards(prev => prev.filter(card => card.id !== id));
        toast.success('Fiche spécialité supprimée avec succès !');
      } else {
        toast.error(result.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la fiche spécialité:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditSpecialty = (card: SpecialtyCard) => {
    setCurrentSpecialty(card);
    setIsAddingSpecialty(true);
  };

  const renderSpecialtyForm = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {currentSpecialty.id ? 'Modifier la spécialité' : 'Nouvelle spécialité'}
            </h3>
            <button
              onClick={() => setIsAddingSpecialty(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la spécialité
              </label>
              <input
                type="text"
                value={currentSpecialty.name}
                onChange={(e) => setCurrentSpecialty(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: Cours de pâtisserie française"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone d'intervention
              </label>
              <input
                type="text"
                value={currentSpecialty.serviceArea}
                onChange={(e) => setCurrentSpecialty(prev => ({ ...prev, serviceArea: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: Lyon et sa périphérie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarif par personne (€)
              </label>
              <input
                type="number"
                value={currentSpecialty.pricePerPerson}
                onChange={(e) => setCurrentSpecialty(prev => ({ ...prev, pricePerPerson: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
                step="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Informations complémentaires
              </label>
              <textarea
                value={currentSpecialty.additionalInfo}
                onChange={(e) => setCurrentSpecialty(prev => ({ ...prev, additionalInfo: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Décrivez votre offre en détail..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matériel requis chez le client
              </label>
              <textarea
                value={currentSpecialty.requiredEquipment}
                onChange={(e) => setCurrentSpecialty(prev => ({ ...prev, requiredEquipment: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Listez le matériel nécessaire..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (3 maximum)
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary transition-colors cursor-pointer relative"
                  >
                    {currentSpecialty.photos[index] ? (
                      <div className="relative w-full h-full">
                        <img
                          src={currentSpecialty.photos[index]}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newPhotos = [...currentSpecialty.photos];
                            newPhotos.splice(index, 1);
                            setCurrentSpecialty(prev => ({ ...prev, photos: newPhotos }));
                          }}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={`photo-${index}`}
                        className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded-lg"
                      >
                        <Upload size={24} className="text-gray-400" />
                      </label>
                    )}
                    <input
                      id={`photo-${index}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Vérifier la taille du fichier (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('La taille de l\'image ne peut pas dépasser 5MB');
                            return;
                          }

                          // Créer un canvas pour redimensionner l'image
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          const img = new Image();

                          img.onload = () => {
                            // Redimensionner l'image (max 800x600)
                            const maxWidth = 800;
                            const maxHeight = 600;
                            let { width, height } = img;

                            if (width > maxWidth || height > maxHeight) {
                              const ratio = Math.min(maxWidth / width, maxHeight / height);
                              width *= ratio;
                              height *= ratio;
                            }

                            canvas.width = width;
                            canvas.height = height;
                            ctx?.drawImage(img, 0, 0, width, height);

                            // Convertir en Base64 avec compression
                            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

                            const newPhotos = [...currentSpecialty.photos];
                            newPhotos[index] = compressedDataUrl;
                            setCurrentSpecialty(prev => ({ ...prev, photos: newPhotos }));
                          };

                          img.src = URL.createObjectURL(file);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsAddingSpecialty(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveSpecialty}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderSpecialtyCards = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Fiches Spécialité</h2>
        {specialtyCards.length < 5 && (
          <button
            onClick={handleAddSpecialty}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Ajouter une spécialité
          </button>
        )}
      </div>

      {specialtyCards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ChefHat size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Vous n'avez pas encore créé de fiche spécialité.
          </p>
          <button
            onClick={handleAddSpecialty}
            className="mt-4 text-primary hover:text-primary/80 font-medium"
          >
            Créer ma première fiche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specialtyCards.map(card => (
            <div
              key={card.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-gray-900">{card.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSpecialty(card)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Settings size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteSpecialty(card.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{card.serviceArea}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Euro size={16} />
                  <span>{card.pricePerPerson}€ par personne</span>
                </div>
              </div>

              {card.photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {card.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Fonctions pour gérer les disponibilités
  const saveWeeklyAvailabilities = async (newAvailabilities: WeeklyAvailabilityInput[]) => {
    if (!user?.id) return;

    try {
      const result = await availabilitiesAPI.updateWeeklyAvailabilities(user.id, newAvailabilities);
      if (result.success) {
        toast.success('Disponibilités hebdomadaires sauvegardées');
        // Recharger les disponibilités
        const updated = await availabilitiesAPI.getAvailabilities(user.id);
        if (updated.success && updated.availabilities) {
          setWeeklyAvailabilities(updated.availabilities.weekly);
        }
      } else {
        toast.error(result.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDayClick = (date: Date) => {
    // setSelectedDate(date);

    // Trouver la disponibilité existante pour cette date
    const existingAvailability = dailyAvailabilities.find(
      av => format(new Date(av.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    // Trouver la disponibilité hebdomadaire par défaut
    const dayOfWeek = getDay(date); // 0=Dimanche, 1=Lundi, etc.
    const defaultWeeklyAvailability = weeklyAvailabilities.find(av => av.dayOfWeek === dayOfWeek);

    setDayModalData({
      date,
      startTime: existingAvailability?.startTime || defaultWeeklyAvailability?.startTime || '09:00',
      endTime: existingAvailability?.endTime || defaultWeeklyAvailability?.endTime || '23:00',
      isAvailable: existingAvailability?.isAvailable ?? true,
      notes: existingAvailability?.notes || ''
    });
    setShowDayModal(true);
  };

  const saveDayAvailability = async () => {
    if (!user?.id || !dayModalData) return;

    try {
      const result = await availabilitiesAPI.updateDailyAvailability(user.id, {
        date: format(dayModalData.date, 'yyyy-MM-dd'),
        startTime: dayModalData.isAvailable ? dayModalData.startTime : undefined,
        endTime: dayModalData.isAvailable ? dayModalData.endTime : undefined,
        isAvailable: dayModalData.isAvailable,
        notes: dayModalData.notes
      });

      if (result.success) {
        toast.success('Disponibilité mise à jour');

        // Mettre à jour la liste locale
        setDailyAvailabilities(prev => {
          const dateStr = format(dayModalData.date, 'yyyy-MM-dd');
          const existingIndex = prev.findIndex(av => format(new Date(av.date), 'yyyy-MM-dd') === dateStr);

          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = result.availability!;
            return updated;
          } else {
            return [...prev, result.availability!];
          }
        });

        setShowDayModal(false);
        setDayModalData(null);
      } else {
        toast.error(result.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };


  const saveWeeklyMealSettings = async () => {
    if (!user?.id) return;

    setSavingMeal(true);
    try {
      const response = await mealAvailabilitiesAPI.saveWeeklySettings(user.id, weeklyMealSettings);

      if (response.success) {
        toast.success('Paramètres hebdomadaires sauvegardés avec succès !');
      } else {
        toast.error(response.message || 'Erreur lors de la sauvegarde des paramètres');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSavingMeal(false);
    }
  };

  const saveDayModal = async () => {
    if (!modalData || !user?.id) return;

    setSavingMeal(true);
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

      setDayMealSettings(prev => ({
        ...prev,
        [modalData.dateKey]: modalData.dayMeals as any
      }));

      setIsMealModalOpen(false);
      setModalData(null);
      toast.success('Disponibilités mises à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des disponibilités');
    } finally {
      setSavingMeal(false);
    }
  };

  const toggleAllMealsForDay = (dayOfWeek: number) => {
    const daySettings = weeklyMealSettings[dayOfWeek];
    if (!daySettings) return;

    const activeMeals = MEAL_TYPE_ORDER.filter(mealType => daySettings[mealType]?.isActive);
    const shouldActivateAll = activeMeals.length < MEAL_TYPE_ORDER.length;

    setWeeklyMealSettings(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...daySettings,
        ...Object.fromEntries(
          MEAL_TYPE_ORDER.map(mealType => [
            mealType,
            {
              ...daySettings[mealType],
              isActive: shouldActivateAll
            }
          ])
        ) as any
      }
    }));
  };

  const updateWeeklyMealSetting = (
    dayOfWeek: number,
    mealType: MealType,
    field: 'isActive' | 'startTime' | 'endTime',
    value: boolean | string
  ) => {
    setWeeklyMealSettings(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [mealType]: {
          ...prev[dayOfWeek]?.[mealType],
          [field]: value
        }
      }
    }));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(year, month, -i);
      days.push({ date: prevDay, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDay = new Date(year, month + 1, day);
      days.push({ date: nextDay, isCurrentMonth: false });
    }

    return days;
  };

  const getDayAvailableMeals = (date: Date) => {
    const dateKey = formatDateToString(date);
    const dayMeals = dayMealSettings[dateKey] || {};
    const dayOfWeek = date.getDay();
    const weeklySettings = weeklyMealSettings[dayOfWeek] || {};

    const available = MEAL_TYPE_ORDER.filter(mealType => {
      const dayMeal = dayMeals[mealType];
      const weeklyMeal = weeklySettings[mealType];

      if (dayMeal) {
        return dayMeal.isAvailable && dayMeal.status === 'AVAILABLE';
      }

      return weeklyMeal?.isActive || false;
    });

    const hasNoConfig = MEAL_TYPE_ORDER.every(mealType => {
      const dayMeal = dayMeals[mealType];
      const weeklyMeal = weeklySettings[mealType];
      return !dayMeal && !weeklyMeal?.isActive;
    });

    return { available, hasNoConfig };
  };

  const getDayColor = (date: Date) => {
    const dayInfo = getDayAvailableMeals(date);

    // Si aucune disponibilité de repas (pas de config = non disponible par défaut)
    if (dayInfo.hasNoConfig || dayInfo.available.length === 0) {
      return 'bg-red-100 border-red-300';
    }

    if (dayInfo.available.length === MEAL_TYPE_ORDER.length) {
      return 'bg-green-100 border-green-300';
    } else {
      return 'bg-blue-100 border-blue-300';
    }
  };

  const openDayModal = (date: Date) => {
    const dateKey = formatDateToString(date);
    const existingSettings = dayMealSettings[dateKey] || {};
    const dayOfWeek = date.getDay();
    const weeklySettings = weeklyMealSettings[dayOfWeek] || {};

    const dayMeals: ModalData['dayMeals'] = {};
    MEAL_TYPE_ORDER.forEach(mealType => {
      // Si il y a des paramètres spécifiques pour ce jour, les utiliser
      if (existingSettings[mealType]) {
        dayMeals[mealType] = existingSettings[mealType];
      } else {
        // Sinon, utiliser la configuration hebdomadaire ou par défaut non disponible
        const weeklyMeal = weeklySettings[mealType];
        dayMeals[mealType] = {
          isAvailable: weeklyMeal?.isActive || false,
          status: (weeklyMeal?.isActive ? 'AVAILABLE' : 'BLOCKED') as MealStatus
        };
      }
    });

    setModalData({
      date,
      dateKey,
      dayMeals
    });
    setIsMealModalOpen(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.profileImage ? (
                    <img
                      src={URL.createObjectURL(formData.profileImage)}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : existingProfileImage ? (
                    <img
                      src={existingProfileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera size={40} className="text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera size={20} />
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      updateFormData('profileImage', file);
                      setExistingProfileImage(null); // Effacer l'image existante quand une nouvelle est sélectionnée
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                placeholder="Parlez de vous, de votre passion pour la cuisine..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expérience en cuisine
              </label>
              <textarea
                rows={4}
                value={formData.experience}
                onChange={(e) => updateFormData('experience', e.target.value)}
                placeholder="Décrivez votre parcours, votre formation..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Spécialités culinaires
              </label>
              <div className="mb-2 text-sm text-gray-600">
                Spécialités sélectionnées : {formData.specialties.join(', ') || 'Aucune'}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {specialtiesList.map((specialty) => (
                  <label
                    key={specialty}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.specialties.includes(specialty)
                        ? 'bg-primary/10 border-primary'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={() => toggleSpecialty(specialty)}
                      className="sr-only"
                    />
                    <span className={`text-sm ${
                      formData.specialties.includes(specialty)
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}>
                      {specialty}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certifications & diplômes
              </label>
              <div className="space-y-2">
                {formData.certificates.map((cert, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => {
                        const newCerts = [...formData.certificates];
                        newCerts[index] = e.target.value;
                        updateFormData('certificates', newCerts);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        const newCerts = formData.certificates.filter((_, i) => i !== index);
                        updateFormData('certificates', newCerts);
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateFormData('certificates', [...formData.certificates, ''])}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  + Ajouter une certification
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone de service (km)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={formData.serviceArea}
                  onChange={(e) => updateFormData('serviceArea', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-center font-medium">{formData.serviceArea} km</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarif horaire (€)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={formData.pricePerHour}
                  onChange={(e) => updateFormData('pricePerHour', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-center font-medium">{formData.pricePerHour} €/h</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée minimum (heures)
              </label>
              <select
                value={formData.minimumDuration}
                onChange={(e) => updateFormData('minimumDuration', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {[1, 2, 3, 4].map(hours => (
                  <option key={hours} value={hours}>{hours} heure{hours > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre maximum de convives
              </label>
              <select
                value={formData.maxGuests}
                onChange={(e) => updateFormData('maxGuests', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {[4, 6, 8, 10, 12, 15, 20].map(guests => (
                  <option key={guests} value={guests}>{guests} personnes</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 3:
        return renderSpecialtyCards();

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Gestion des disponibilités par repas
                </h2>
                <button
                  onClick={saveWeeklyMealSettings}
                  disabled={savingMeal}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {savingMeal ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>

              {/* Configuration hebdomadaire */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Configuration hebdomadaire</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                  {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                    const daySettings = weeklyMealSettings[dayIndex];
                    if (!daySettings) {
                      // Return placeholder if settings not loaded yet
                      return (
                        <div key={dayIndex} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="space-y-2">
                            {[1,2,3,4].map(i => (
                              <div key={i} className="h-3 bg-gray-200 rounded"></div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    const hasAllActive = MEAL_TYPE_ORDER.every(mealType => daySettings[mealType]?.isActive);
                    const hasAnyActive = MEAL_TYPE_ORDER.some(mealType => daySettings[mealType]?.isActive);

                    return (
                      <div key={dayIndex} className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-base mb-1">{dayName}</h4>
                          </div>
                          <div className="flex flex-col items-end">
                            <button
                              onClick={() => toggleAllMealsForDay(dayIndex)}
                              className="flex items-center gap-2 text-xs text-gray-600 hover:text-primary transition-colors p-1 -m-1 rounded"
                              title={hasAllActive ? 'Tout désélectionner' : 'Tout sélectionner'}
                            >
                              <span className="font-medium">Tous</span>
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
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {MEAL_TYPE_ORDER.map(mealType => {
                            const mealSetting = daySettings[mealType];
                            if (!mealSetting) return null;

                            const isActive = mealSetting.isActive;

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
                                    onChange={(e) => updateWeeklyMealSetting(dayIndex, mealType, 'isActive', e.target.checked)}
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
              </div>

              {/* Calendrier mensuel pour gestion journalière */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold capitalize">
                    Agenda - {mealCurrentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMealCurrentDate(new Date(mealCurrentDate.getFullYear(), mealCurrentDate.getMonth() - 1, 1))}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setMealCurrentDate(new Date(mealCurrentDate.getFullYear(), mealCurrentDate.getMonth() + 1, 1))}
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

                {mealLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(mealCurrentDate).map(({ date, isCurrentMonth }, index) => {
                      const dayInfo = getDayAvailableMeals(date);
                      const todayCheck = isToday(date);

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
                            ${todayCheck && isCurrentMonth ? 'ring-2 ring-primary' : ''}
                          `}
                        >
                          <div className={`text-sm font-medium mb-2 ${todayCheck ? 'text-primary' : ''}`}>
                            {date.getDate()}
                          </div>

                          {isCurrentMonth && (
                            <div className="flex-1 flex flex-col items-center justify-center gap-1">
                              {dayInfo.hasNoConfig ? (
                                <div className="flex items-center justify-center">
                                  <X className="w-4 h-4 text-red-600" />
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-1">
                                  {dayInfo.available.map(mealType => (
                                    <div key={mealType} className="flex items-center justify-center">
                                      {getMealIcon(mealType, 'w-3 h-3 text-gray-600')}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="mt-1 flex items-center justify-center">
                                <Edit3 className="w-2 h-2 text-gray-400" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  </>
                )}

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
                      <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                      <span>Aucune disponibilité</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
                      <span>Non configuré</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuration Kooker</h1>
        <p className="text-gray-600 mt-2">
          Complétez votre profil pour proposer vos services culinaires
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression</span>
          <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => (
              <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                <div className="flex items-center">
                  <div
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full ${
                      index <= currentStep
                        ? 'bg-primary text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-900 hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index !== steps.length - 1 && (
                  <div className="absolute top-4 left-4 -ml-px h-0.5 w-full bg-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600 mt-1">
            {steps[currentStep].description}
          </p>
        </div>

        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>

        <div className="flex gap-4">
          <button
            onClick={saveKookerProfile}
            disabled={isSaving}
            className="px-6 py-2 text-primary border border-primary rounded-md hover:bg-primary/5 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={saveKookerProfile}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <CheckCircle2 size={20} />
              {isSaving ? 'Finalisation...' : 'Finaliser le profil'}
            </button>
          )}
        </div>
      </div>

      {/* Specialty Form Modal */}
      {isAddingSpecialty && renderSpecialtyForm()}

      {/* Day Availability Modal */}
      {showDayModal && dayModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Disponibilité du {format(dayModalData.date, 'dd/MM/yyyy')}
              </h3>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={dayModalData.isAvailable}
                    onChange={(e) => setDayModalData(prev => prev ? { ...prev, isAvailable: e.target.checked } : null)}
                    className="mr-2"
                  />
                  Disponible ce jour
                </label>

                {dayModalData.isAvailable && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Heure de début
                        </label>
                        <input
                          type="time"
                          value={dayModalData.startTime}
                          onChange={(e) => setDayModalData(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Heure de fin
                        </label>
                        <input
                          type="time"
                          value={dayModalData.endTime}
                          onChange={(e) => setDayModalData(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={dayModalData.notes}
                    onChange={(e) => setDayModalData(prev => prev ? { ...prev, notes: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Notes particulières pour ce jour..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDayModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={saveDayAvailability}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour édition des disponibilités par jour */}
      {isMealModalOpen && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setIsMealModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Header avec date et jour - même style que la configuration hebdomadaire */}
              <div className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 transition-colors mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-base mb-1">
                      {modalData.date.toLocaleDateString('fr-FR', { weekday: 'long' })}
                    </h4>
                    <p className="text-sm text-gray-600 font-semibold">
                      {modalData.date.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => {
                        const activeMeals = MEAL_TYPE_ORDER.filter(mealType => {
                          const meal = modalData.dayMeals[mealType] || { isAvailable: true, status: 'AVAILABLE' as MealStatus };
                          return meal.isAvailable && meal.status === 'AVAILABLE';
                        });
                        const shouldActivateAll = activeMeals.length < MEAL_TYPE_ORDER.length;

                        const newDayMeals: typeof modalData.dayMeals = {};
                        MEAL_TYPE_ORDER.forEach(mealType => {
                          newDayMeals[mealType] = {
                            isAvailable: shouldActivateAll,
                            status: shouldActivateAll ? 'AVAILABLE' as MealStatus : 'BLOCKED' as MealStatus,
                            notes: modalData.dayMeals[mealType]?.notes
                          };
                        });

                        setModalData(prev => prev ? {
                          ...prev,
                          dayMeals: newDayMeals
                        } : null);
                      }}
                      className="flex items-center gap-2 text-xs text-gray-600 hover:text-primary transition-colors p-1 -m-1 rounded"
                      title={(() => {
                        const activeMeals = MEAL_TYPE_ORDER.filter(mealType => {
                          const meal = modalData.dayMeals[mealType] || { isAvailable: true, status: 'AVAILABLE' as MealStatus };
                          return meal.isAvailable && meal.status === 'AVAILABLE';
                        });
                        return activeMeals.length === MEAL_TYPE_ORDER.length ? 'Tout désélectionner' : 'Tout sélectionner';
                      })()}
                    >
                      <span className="font-medium">Tous</span>
                      <div className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                        ${(() => {
                          const activeMeals = MEAL_TYPE_ORDER.filter(mealType => {
                            const meal = modalData.dayMeals[mealType] || { isAvailable: true, status: 'AVAILABLE' as MealStatus };
                            return meal.isAvailable && meal.status === 'AVAILABLE';
                          });
                          const hasAllActive = activeMeals.length === MEAL_TYPE_ORDER.length;
                          const hasAnyActive = activeMeals.length > 0;

                          if (hasAllActive) {
                            return 'bg-green-500 border-green-500';
                          } else if (hasAnyActive) {
                            return 'bg-yellow-500 border-yellow-500';
                          } else {
                            return 'bg-gray-300 border-gray-300';
                          }
                        })()}
                      `}>
                        {(() => {
                          const activeMeals = MEAL_TYPE_ORDER.filter(mealType => {
                            const meal = modalData.dayMeals[mealType] || { isAvailable: true, status: 'AVAILABLE' as MealStatus };
                            return meal.isAvailable && meal.status === 'AVAILABLE';
                          });
                          const hasAllActive = activeMeals.length === MEAL_TYPE_ORDER.length;
                          const hasAnyActive = activeMeals.length > 0;

                          if (hasAllActive) {
                            return (
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            );
                          } else if (hasAnyActive) {
                            return <div className="w-1.5 h-1.5 bg-white rounded-full"></div>;
                          }
                          return null;
                        })()}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {MEAL_TYPE_ORDER.map(mealType => {
                    const meal = modalData.dayMeals[mealType] || {
                      isAvailable: true,
                      status: 'AVAILABLE' as MealStatus
                    };

                    const isActive = meal.isAvailable && meal.status === 'AVAILABLE';

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
                              setModalData(prev => prev ? {
                                ...prev,
                                dayMeals: {
                                  ...prev.dayMeals,
                                  [mealType]: {
                                    ...meal,
                                    isAvailable: e.target.checked,
                                    status: e.target.checked ? 'AVAILABLE' as MealStatus : 'BLOCKED' as MealStatus
                                  }
                                }
                              } : null);
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

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsMealModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={saveDayModal}
                  disabled={savingMeal}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {savingMeal ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default KookerSettingsPage;