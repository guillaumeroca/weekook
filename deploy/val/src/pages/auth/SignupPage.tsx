import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const SignupPage: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormData>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  const password = watch('password');

  React.useEffect(() => {
    if (user) {
      toast("Vous êtes déjà inscrit sur notre plateforme", {
        description: "Utilisez le formulaire de connexion pour accéder à votre compte.",
        action: {
          label: "Se connecter",
          onClick: () => navigate('/login')
        },
        dismissible: true,
        duration: 5000
      });
      navigate('/login');
    }
  }, [user, navigate]);

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      await signup(data.email, data.password, data.acceptTerms);
      navigate('/settings');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur s'est produite lors de l'inscription.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Créer un compte</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email', { 
              required: 'Email requis', 
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email invalide'
              }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            {...register('password', { 
              required: 'Mot de passe requis',
              minLength: {
                value: 8,
                message: 'Le mot de passe doit contenir au moins 8 caractères'
              }
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', { 
              required: 'Veuillez confirmer votre mot de passe',
              validate: value => value === password || 'Les mots de passe ne correspondent pas'
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start">
          <input
            id="acceptTerms"
            type="checkbox"
            {...register('acceptTerms', { required: 'Vous devez accepter les conditions générales' })}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
          />
          <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
            J'accepte les <Link to="/terms" className="text-primary hover:text-primary/80">conditions générales</Link> et la <a href="#" className="text-primary hover:text-primary/80">politique de confidentialité</a>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Inscription en cours...' : "S'inscrire"}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-primary hover:text-primary/80">
          Se connecter
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;