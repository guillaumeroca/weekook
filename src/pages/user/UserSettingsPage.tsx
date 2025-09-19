import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { ChefHat, Settings, History, Star, Save, MessageCircle } from 'lucide-react';
import { messagesAPI } from '../../api/messages';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  postalCode: string;  // Code postal français (5 chiffres)
  city: string;
}

interface ExtendedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  postalCode?: string;  // Code postal français (5 chiffres)
  city?: string;
  isKooker: boolean;
  isVerified: boolean;
}

const UserSettingsPage: React.FC = () => {
  const { user, becomeKooker, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<ExtendedUser | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
    }
  });

  // Récupérer les données complètes de l'utilisateur et le nombre de messages non lus
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/user/${user.id}`);
        const result = await response.json();

        if (result.success) {
          setUserData(result.user);
          // Mettre à jour le formulaire avec les données de la BDD
          reset({
            firstName: result.user.firstName || '',
            lastName: result.user.lastName || '',
            phone: result.user.phone || '',
            address: result.user.address || '',
            postalCode: result.user.postalCode || '',
            city: result.user.city || '',
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      } finally {
        setDataLoading(false);
      }
    };

    const fetchUnreadCount = async () => {
      if (!user?.id) return;

      try {
        const response = await messagesAPI.getUnreadCount(user.id);
        if (response.success && response.count !== undefined) {
          setUnreadCount(response.count);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre de messages non lus:', error);
      }
    };

    fetchUserData();
    fetchUnreadCount();
  }, [user?.id, reset]);

  const handleBecomeKooker = async () => {
    setIsLoading(true);
    try {
      await becomeKooker();
    } catch (error) {
      console.error('Error becoming kooker:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const displayUser = userData || user;

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon profil</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">
                  {displayUser.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium">
                  {displayUser.firstName && displayUser.lastName 
                    ? `${displayUser.firstName} ${displayUser.lastName}` 
                    : displayUser.email
                  }
                </h3>
                <p className="text-sm text-gray-500">
                  {displayUser.isKooker ? 'Client & Kooker' : 'Client'}
                </p>
                {!displayUser.isVerified && (
                  <p className="text-sm text-orange-600">Email non vérifié</p>
                )}
                {(displayUser.city || displayUser.address) && (
                  <p className="text-sm text-gray-500">
                    <button
                      onClick={() => {
                        // Détection du système d'exploitation
                        const userAgent = navigator.userAgent.toLowerCase();
                        const isIOS = /iphone|ipad|ipod/.test(userAgent);
                        const isAndroid = /android/.test(userAgent);
                        
                        // Construire l'adresse complète avec code postal
                        const fullAddress = [displayUser.address, displayUser.postalCode, displayUser.city].filter(Boolean).join(', ');
                        const searchQuery = fullAddress || displayUser.city || displayUser.address;
                        
                        let mapsUrl = '';
                        
                        if (isIOS) {
                          // Apple Maps sur iOS
                          mapsUrl = `http://maps.apple.com/?q=${encodeURIComponent(searchQuery)}`;
                        } else if (isAndroid) {
                          // Google Maps sur Android
                          mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}`;
                        } else {
                          // Google Maps sur desktop
                          mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}`;
                        }
                        
                        window.open(mapsUrl, '_blank');
                      }}
                      className="hover:text-primary transition-colors cursor-pointer"
                      title="Voir sur la carte"
                    >
                      📍 {displayUser.address 
                        ? `${displayUser.address}${displayUser.postalCode ? ', ' + displayUser.postalCode : ''}, ${displayUser.city}` 
                        : displayUser.city}
                    </button>
                  </p>
                )}
              </div>
            </div>
            
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium rounded-md ${
                  activeTab === 'profile' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings size={18} />
                <span>Paramètres du profil</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium rounded-md ${
                  activeTab === 'history' 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <History size={18} />
                <span>Historique</span>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium rounded-md ${
                  activeTab === 'reviews'
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Star size={18} />
                <span>Avis</span>
              </button>
              <Link
                to="/messages"
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 relative"
              >
                <MessageCircle size={18} />
                <span>Messages</span>
                {unreadCount > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full ml-auto">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
          
          {!user.isKooker && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-dashed border-primary/50">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat size={24} className="text-primary" />
                <h3 className="font-semibold text-gray-800">Devenir Kooker</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Partagez votre passion pour la cuisine et gagnez un revenu supplémentaire.
              </p>
              <button 
                onClick={handleBecomeKooker}
                disabled={isLoading}
                className={`w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Inscription...' : 'Devenir Kooker'}
              </button>
            </div>
          )}

          {user.isKooker && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat size={24} className="text-primary" />
                <h3 className="font-semibold text-gray-800">Mode Kooker</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Vous êtes déjà inscrit comme Kooker. Gérez votre profil et vos disponibilités.
              </p>
              <Link 
                to="/kooker-settings" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors inline-block text-center"
              >
                Accéder à mon profil Kooker
              </Link>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Paramètres du profil</h2>
                
                <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={displayUser.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      L'adresse email ne peut pas être modifiée
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        {...register('firstName', { required: 'Le prénom est requis' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        {...register('lastName', { required: 'Le nom est requis' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <input
                      id="address"
                      type="text"
                      {...register('address')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        maxLength={5}
                        pattern="[0-9]{5}"
                        {...register('postalCode', { 
                          pattern: {
                            value: /^[0-9]{5}$/,
                            message: 'Le code postal doit contenir exactement 5 chiffres'
                          }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Ex: 75001"
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ville
                      </label>
                      <input
                        id="city"
                        type="text"
                        {...register('city')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className={`bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center gap-2 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Save size={18} />
                      {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'history' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Historique des réservations</h2>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-500 italic">Vous n'avez pas encore de réservations.</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Avis</h2>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-500 italic">Vous n'avez pas encore d'avis.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;