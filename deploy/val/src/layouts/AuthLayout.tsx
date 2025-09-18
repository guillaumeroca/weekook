import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const AuthLayout: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Left side - auth forms */}
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <ChefHat size={36} className="text-primary" />
          <span className="text-2xl font-bold text-primary">WEEKOOK</span>
        </Link>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
      
      {/* Right side - image (hidden on mobile) */}
      <div className="hidden md:block md:w-1/2 bg-cover bg-center" 
           style={{ 
             backgroundImage: "url('https://images.pexels.com/photos/4259140/pexels-photo-4259140.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')", 
             backgroundPosition: "center" 
           }}>
        <div className="h-full w-full bg-primary/20 backdrop-brightness-75 flex items-center justify-center">
          <div className="text-white text-center p-8 max-w-lg">
            <h2 className="text-3xl font-bold mb-4">La cuisine à domicile réinventée</h2>
            <p className="text-xl">Réservez un chef ou devenez Kooker et partagez votre passion culinaire</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;