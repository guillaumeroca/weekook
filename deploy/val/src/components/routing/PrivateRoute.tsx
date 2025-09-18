import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Temporairement désactivé - permettre l'accès aux utilisateurs non vérifiés
  // if (!user.isVerified) {
  //   return <Navigate to="/" />;
  // }

  return <>{children}</>;
};

export default PrivateRoute;