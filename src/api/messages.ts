import { config } from '../config/generated';

const API_BASE_URL = config.urls.api;

export interface ConversationData {
  id: string;
  userId: string;
  kookerId: string;
  lastMessageAt: string;
  isActiveUser: boolean;
  isActiveKooker: boolean;
  userInfo: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  kookerInfo: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  lastMessage?: MessageData;
  unreadCount: number;
}

export interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  senderInfo: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export interface SendMessageData {
  conversationId?: string;
  recipientId: string;
  content: string;
}

export const messagesAPI = {
  async getConversations(userId: string): Promise<{ success: boolean; conversations?: ConversationData[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversations/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get conversations error:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des conversations'
      };
    }
  },

  async getConversation(conversationId: string): Promise<{ success: boolean; conversation?: ConversationData; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversation/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get conversation error:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération de la conversation'
      };
    }
  },

  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<{ success: boolean; messages?: MessageData[]; hasMore?: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${conversationId}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get messages error:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des messages'
      };
    }
  },

  async sendMessage(data: SendMessageData & { senderId?: string }): Promise<{ success: boolean; message?: MessageData; conversation?: ConversationData; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Send message error:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'envoi du message'
      };
    }
  },

  async markAsRead(conversationId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId, userId }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Mark as read error:', error);
      return {
        success: false,
        message: 'Erreur lors du marquage comme lu'
      };
    }
  },

  async createConversation(userId: string, kookerId: string): Promise<{ success: boolean; conversation?: ConversationData; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, kookerId }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create conversation error:', error);
      return {
        success: false,
        message: 'Erreur lors de la création de la conversation'
      };
    }
  },

  async deleteConversation(conversationId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/conversation/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete conversation error:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression de la conversation'
      };
    }
  },

  async getUnreadCount(userId: string): Promise<{ success: boolean; count?: number; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/unread-count/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get unread count error:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération du nombre de messages non lus'
      };
    }
  }
};