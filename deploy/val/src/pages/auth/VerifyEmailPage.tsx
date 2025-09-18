import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChefHat } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Token de vérification manquant');
      setIsVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch {
        setError("Une erreur s'est produite lors de la vérification de votre email");
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [searchParams, verifyEmail, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <ChefHat size={48} className="text-primary mx-auto mb-6" />
        
        {isVerifying ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Vérification de votre email...
            </h1>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Erreur de vérification
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Retour à l'accueil
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              Email vérifié avec succès !
            </h1>
            <p className="text-gray-600 mb-8">
              Vous allez être redirigé vers la page d'accueil...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;