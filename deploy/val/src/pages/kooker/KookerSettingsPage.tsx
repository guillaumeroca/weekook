import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import { ChefHat, Settings, ChevronLeft, ChevronRight, Camera, MapPin, Euro, Plus, X, Upload, Save, CheckCircle2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { toast } from 'sonner';

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
    id: 'availability',
    title: 'Disponibilités',
    description: 'Vos créneaux horaires'
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

const daysOfWeek = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche"
];

const KookerSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<KookerFormData>(initialFormData);
  const [completionPercentage, setCompletionPercentage] = useState(25);
  const [activeTab, _setActiveTab] = useState('profile');
  const [isPublished, _setIsPublished] = useState(false);
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

  // Charger les données du profil Kooker
  useEffect(() => {
    const loadKookerProfile = async () => {
      if (!user?.id || !user.isKooker || dataLoadedRef.current) {
        if (!user?.id || !user.isKooker) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const result = await authAPI.getKookerProfile(user.id);
        
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
        console.error('Erreur lors du chargement du profil Kooker:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setIsLoading(false);
      }
    };

    loadKookerProfile();
  }, [user?.id, user?.isKooker]);

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
          
          img.src = URL.createObjectURL(formData.profileImage);
        });
      }

      const result = await authAPI.updateKookerProfile(user.id, {
        bio: formData.bio,
        experience: formData.experience,
        profileImage: profileImageBase64,
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

  const updateFormData = (field: keyof KookerFormData, value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Calculate completion percentage
      let completed = 0;
      const total = Object.keys(initialFormData).length;
      
      Object.entries(newData).forEach(([key, value]) => {
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

  const toggleDay = (day: string) => {
    const days = formData.availableDays.includes(day)
      ? formData.availableDays.filter(d => d !== day)
      : [...formData.availableDays, day];
    updateFormData('availableDays', days);
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
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Jours de disponibilité
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {daysOfWeek.map((day) => (
                  <label
                    key={day}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.availableDays.includes(day)
                        ? 'bg-primary/10 border-primary'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.availableDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="sr-only"
                    />
                    <span className={`text-sm ${
                      formData.availableDays.includes(day)
                        ? 'text-primary'
                        : 'text-gray-700'
                    }`}>
                      {day}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de début
                </label>
                <select
                  value={formData.typicalHours.start}
                  onChange={(e) => updateFormData('typicalHours', {
                    ...formData.typicalHours,
                    start: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {hour.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de fin
                </label>
                <select
                  value={formData.typicalHours.end}
                  onChange={(e) => updateFormData('typicalHours', {
                    ...formData.typicalHours,
                    end: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                
                >
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                      {hour.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <ChefHat size={32} className="text-primary" />
        <h1 className="text-3xl font-bold text-gray-900">Devenir Kooker</h1>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression du profil</span>
          <span className="text-sm font-medium text-primary">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="hidden md:grid grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`relative ${
                index < currentStep
                  ? 'text-primary'
                  : index === currentStep
                  ? 'text-primary'
                  : 'text-gray-400'
              }`}
            >
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${index <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {index < currentStep ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  absolute top-4 left-8 w-full h-0.5
                  ${index < currentStep ? 'bg-primary' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile stepper */}
        <div className="md:hidden">
          <p className="text-sm font-medium text-gray-700">
            Étape {currentStep + 1} sur {steps.length}
          </p>
          <h2 className="text-lg font-semibold text-primary mt-1">
            {steps[currentStep].title}
          </h2>
          <p className="text-sm text-gray-500">
            {steps[currentStep].description}
          </p>
        </div>
      </div>

      {/* Form content */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`
            px-6 py-2 rounded-lg flex items-center gap-2
            ${currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          `}
        >
          <ChevronLeft size={20} />
          Précédent
        </button>

        <div className="flex gap-4">
          <button
            onClick={saveKookerProfile}
            disabled={isSaving}
            className={`
              bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2
              ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Save size={20} />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={isSaving}
            className={`
              bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg flex items-center gap-2
              ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {currentStep === steps.length - 1 ? (
              <>
                {isSaving ? 'Sauvegarde...' : 'Terminer'}
                <CheckCircle2 size={20} />
              </>
            ) : (
              <>
                {isSaving ? 'Sauvegarde...' : 'Suivant'}
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add the specialty cards section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        {renderSpecialtyCards()}
      </div>

      {/* Modal for adding/editing specialty */}
      {isAddingSpecialty && renderSpecialtyForm()}
    </div>
  );
};

export default KookerSettingsPage;