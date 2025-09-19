import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { messagesAPI } from '../../api/messages';
import { useAuth } from '../../contexts/AuthContext';

interface ChatButtonProps {
  kookerId: string;
  kookerName: string;
  onChatStart?: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ kookerId, kookerName, onChatStart }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartChat = async () => {
    console.log('Bouton cliqué - User:', user?.id, 'Kooker:', kookerId);

    if (!user?.id) {
      console.log('Utilisateur non connecté');
      setError('Vous devez être connecté pour envoyer un message');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Création de la conversation...');
      const response = await messagesAPI.createConversation(user.id, kookerId);
      console.log('Réponse API:', response);

      if (response.success) {
        onChatStart?.();
        navigate('/messages');
      } else {
        setError(response.message || 'Erreur lors de la création de la conversation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.id === kookerId) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleStartChat}
        disabled={loading}
        className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        ) : (
          <>
            <MessageCircle size={16} />
            Contacter {kookerName}
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 ml-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;