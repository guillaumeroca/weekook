import React, { useEffect, useState } from 'react';
import { MessageCircle, User, Clock } from 'lucide-react';
import { messagesAPI, ConversationData } from '../../api/messages';
import { useAuth } from '../../contexts/AuthContext';

interface ConversationListProps {
  onSelectConversation: (conversation: ConversationData) => void;
  selectedConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId
}) => {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await messagesAPI.getConversations(user.id);

      if (response.success && response.conversations) {
        setConversations(response.conversations);
      } else {
        setError(response.message || 'Erreur lors du chargement des conversations');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}j`;
    }
  };

  const getOtherParticipant = (conversation: ConversationData) => {
    if (user?.id === conversation.userId) {
      return conversation.kookerInfo;
    } else {
      return conversation.userInfo;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadConversations}
          className="mt-2 text-primary hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center p-8">
        <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune conversation
        </h3>
        <p className="text-gray-600">
          Vos conversations apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        const isSelected = selectedConversationId === conversation.id;

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 border-l-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              isSelected ? 'border-primary bg-primary/5' : 'border-transparent'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {otherParticipant.firstName} {otherParticipant.lastName}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>

                {conversation.lastMessage && (
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {conversation.lastMessage.content}
                  </p>
                )}

                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {formatLastMessageTime(conversation.lastMessageAt)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;