import React, { useEffect, useState, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { messagesAPI, MessageData, ConversationData } from '../../api/messages';
import { useAuth } from '../../contexts/AuthContext';

interface ChatWindowProps {
  conversation: ConversationData;
  onMessageSent?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onMessageSent }) => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (conversation.id) {
      loadMessages();
      markAsRead();
    }
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getMessages(conversation.id);

      if (response.success && response.messages) {
        setMessages(response.messages.reverse());
      } else {
        setError(response.message || 'Erreur lors du chargement des messages');
      }
    } catch (error) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!user?.id) return;

    try {
      await messagesAPI.markAsRead(conversation.id, user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      if (!user?.id) {
        setError('Utilisateur non connecté');
        setNewMessage(messageContent);
        return;
      }

      const otherParticipantId = user.id === conversation.userId
        ? conversation.kookerId
        : conversation.userId;

      const response = await messagesAPI.sendMessage({
        conversationId: conversation.id,
        recipientId: otherParticipantId,
        content: messageContent,
        senderId: user.id
      });

      if (response.success && response.message) {
        setMessages(prev => [...prev, response.message!]);
        onMessageSent?.();
      } else {
        setError(response.error || 'Erreur lors de l\'envoi du message');
        setNewMessage(messageContent);
      }
    } catch (error) {
      setError('Erreur de connexion');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherParticipant = () => {
    if (user?.id === conversation.userId) {
      return conversation.kookerInfo;
    } else {
      return conversation.userInfo;
    }
  };

  const otherParticipant = getOtherParticipant();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <User size={16} className="text-gray-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {otherParticipant.firstName} {otherParticipant.lastName}
          </h3>
          <p className="text-sm text-gray-500">{otherParticipant.email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4">
            <p>{error}</p>
            <button
              onClick={loadMessages}
              className="mt-2 text-primary hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 p-8">
            <p>Aucun message dans cette conversation</p>
            <p className="text-sm mt-1">Envoyez votre premier message !</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-200' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;