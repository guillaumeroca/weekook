import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { ConversationData, messagesAPI } from '../api/messages';

const MessagesPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
    }
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const response = await messagesAPI.getUnreadCount(user.id);
      if (response.success && response.count !== undefined) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleSelectConversation = (conversation: ConversationData) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSent = () => {
    // Recharger le compteur de messages non lus et la liste des conversations
    loadUnreadCount();
    // On pourrait aussi recharger la liste des conversations ici si nécessaire
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connexion requise
          </h2>
          <p className="text-gray-600">
            Vous devez être connecté pour accéder à vos messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <MessageCircle size={32} className="text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600">
                Communiquez avec les kookers et clients
                {unreadCount > 0 && (
                  <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: '70vh' }}>
          <div className="flex h-full">
            {/* Liste des conversations */}
            <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-200 flex flex-col`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationList
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversation?.id}
                />
              </div>
            </div>

            {/* Fenêtre de chat */}
            <div className={`${selectedConversation ? 'block' : 'hidden md:block'} w-full md:w-2/3 flex flex-col`}>
              {selectedConversation ? (
                <>
                  {/* Bouton retour mobile */}
                  <div className="md:hidden p-4 border-b border-gray-200 flex items-center">
                    <button
                      onClick={handleBackToList}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft size={20} />
                      Retour aux conversations
                    </button>
                  </div>

                  <div className="flex-1">
                    <ChatWindow
                      conversation={selectedConversation}
                      onMessageSent={handleMessageSent}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle size={64} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-600">
                      Choisissez une conversation dans la liste pour commencer à discuter
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;