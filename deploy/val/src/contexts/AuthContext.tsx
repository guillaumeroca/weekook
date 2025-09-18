import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { authAPI, AuthUser } from '../api/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, acceptedTerms: boolean) => Promise<void>;
  logout: () => void;
  becomeKooker: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
  }) => Promise<void>;
  updateKookerProfile: (data: {
    bio?: string;
    experience?: string;
    profileImage?: string;
    coverImage?: string;
    serviceArea?: number;
    pricePerHour?: number;
    minimumDuration?: number;
    maxGuests?: number;
    specialties?: string[];
    certificates?: string[];
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il y a un utilisateur stocké au démarrage
    const storedUser = localStorage.getItem('weekook_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('weekook_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const result = await authAPI.login({ email, password });
      
      if (!result.success || !result.user) {
        throw new Error(result.message || 'Email ou mot de passe incorrect');
      }
      
      setUser(result.user);
      localStorage.setItem('weekook_user', JSON.stringify(result.user));
      toast.success('Connexion réussie !');
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Erreur de connexion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, acceptedTerms: boolean) => {
    if (!acceptedTerms) {
      throw new Error('Vous devez accepter les conditions générales');
    }
    
    setLoading(true);
    
    try {
      const result = await authAPI.signup({ email, password });
      
      if (!result.success || !result.user) {
        throw new Error(result.message || "Erreur lors de l'inscription");
      }
      
      toast.success("Compte créé avec succès ! Un email de confirmation vous a été envoyé.");
      
      setUser(result.user);
      localStorage.setItem('weekook_user', JSON.stringify(result.user));
    } catch (error: unknown) {
      toast.error((error as Error).message || "Erreur lors de l'inscription");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (_token: string) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const result = await authAPI.verifyEmail(user.id);
      
      if (result.success) {
        const updatedUser = {
          ...user,
          isVerified: true
        };
        
        setUser(updatedUser);
        localStorage.setItem('weekook_user', JSON.stringify(updatedUser));
        toast.success("Votre email a été vérifié avec succès !");
      } else {
        throw new Error(result.message || "Erreur lors de la vérification");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Une erreur s'est produite lors de la vérification");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('weekook_user');
    toast.success('Déconnexion réussie');
  };

  const becomeKooker = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const result = await authAPI.becomeKooker(user.id);
      
      if (result.success) {
        const updatedUser = {
          ...user,
          isKooker: true
        };
        
        setUser(updatedUser);
        localStorage.setItem('weekook_user', JSON.stringify(updatedUser));
        toast.success("Vous êtes maintenant inscrit comme Kooker !");
      } else {
        throw new Error(result.message || "Erreur lors de l'inscription comme Kooker");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Une erreur s'est produite lors de l'inscription comme Kooker");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
  }) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const result = await authAPI.updateProfile(user.id, data);
      
      if (result.success) {
        const updatedUser = {
          ...user,
          firstName: data.firstName || user.firstName,
          lastName: data.lastName || user.lastName,
          phone: data.phone || user.phone,
          address: data.address || user.address,
          postalCode: data.postalCode || user.postalCode,
          city: data.city || user.city,
        };
        
        setUser(updatedUser);
        localStorage.setItem('weekook_user', JSON.stringify(updatedUser));
        toast.success("Profil mis à jour avec succès !");
      } else {
        throw new Error(result.message || "Erreur lors de la mise à jour du profil");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Erreur lors de la mise à jour du profil");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateKookerProfile = async (data: {
    bio?: string;
    experience?: string;
    profileImage?: string;
    coverImage?: string;
    serviceArea?: number;
    pricePerHour?: number;
    minimumDuration?: number;
    maxGuests?: number;
    specialties?: string[];
    certificates?: string[];
  }) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const result = await authAPI.updateKookerProfile(user.id, data);
      
      if (result.success) {
        toast.success("Profil Kooker mis à jour avec succès !");
      } else {
        throw new Error(result.message || "Erreur lors de la mise à jour du profil Kooker");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Erreur lors de la mise à jour du profil Kooker");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    becomeKooker,
    verifyEmail,
    updateProfile,
    updateKookerProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};