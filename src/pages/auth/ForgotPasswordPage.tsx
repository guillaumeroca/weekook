import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (_data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSent(true);
      toast.success("Un email de réinitialisation vous a été envoyé");
    } catch {
      toast.error("Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} />
        Retour à la connexion
      </Link>

      <div className="text-center mb-8">
        <ChefHat size={40} className="text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Mot de passe oublié ?</h1>
        <p className="text-gray-600">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      {emailSent ? (
        <div className="text-center">
          <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">
            <p className="font-medium">Email envoyé !</p>
            <p className="text-sm mt-1">
              Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
            </p>
          </div>
          <Link 
            to="/login"
            className="text-primary hover:text-primary/80"
          >
            Retour à la connexion
          </Link>
        </div>
      ) : (
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
              placeholder="votre@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;