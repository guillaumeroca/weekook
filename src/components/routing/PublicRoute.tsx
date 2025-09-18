import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    </div>;
  }

  if (user) {
    return <Navigate to="/settings" />;
  }

  return <>{children}</>;
};

export default PublicRoute;