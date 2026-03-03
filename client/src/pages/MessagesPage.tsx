import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MessageUser {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  read: boolean;
  kookerRecipientId: number | null;
  createdAt: string;
  sender: MessageUser;
  receiver: MessageUser;
}

interface Conversation {
  user: MessageUser;
  lastMessage: Message;
  unreadCount: number;
  kookerRecipientId: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(u: MessageUser) {
  return ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase() || '?';
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function formatFullTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function Avatar({ user, size = 44 }: { user: MessageUser; size?: number }) {
  return user.avatar ? (
    <img
      src={user.avatar}
      alt={user.firstName}
      style={{ width: size, height: size }}
      className="rounded-full object-cover flex-shrink-0"
    />
  ) : (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-gradient-to-br from-[#c1a0fd] to-[#8b6fce] flex items-center justify-center text-white font-bold flex-shrink-0"
    >
      {initials(user)}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuth();
  const { refreshUnread } = useNotification();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Params URL
  const toUserId = searchParams.get('to') ? parseInt(searchParams.get('to')!, 10) : null;
  const kookerContext = searchParams.get('kookerContext')
    ? parseInt(searchParams.get('kookerContext')!, 10)
    : null;

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  // Pour les kookers : filtre de contexte
  const [kookerFilter, setKookerFilter] = useState<'user' | 'kooker'>('user');
  // Confirmation suppression
  const [pendingDelete, setPendingDelete] = useState<
    { type: 'message'; id: number } | { type: 'conversation'; id: number } | null
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Chargement conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get<Conversation[]>('/messages/conversations');
      if (res.success && res.data) setConversations(res.data);
    } catch {
      // silencieux
    } finally {
      setConvLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Ouvrir conversation automatiquement si ?to=userId
  useEffect(() => {
    if (!toUserId || conversations.length === 0) return;
    const existing = conversations.find(c => c.user.id === toUserId);
    if (existing) {
      openConversation(existing);
    } else {
      // Pas encore de conversation : créer un contact fictif
      const ghost: Conversation = {
        user: { id: toUserId, firstName: '...', lastName: '', avatar: null },
        lastMessage: {} as Message,
        unreadCount: 0,
        kookerRecipientId: null,
      };
      setActiveConv(ghost);
      setMessages([]);
    }
  }, [toUserId, conversations]);

  // ── Scroll automatique vers le bas (dans le conteneur uniquement)
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ── Polling messages actifs toutes les 3s
  useEffect(() => {
    if (!activeConv) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await api.get<Message[]>(`/messages/conversation/${activeConv.user.id}`);
        if (res.success && res.data) {
          setMessages(prev => {
            // Si nouveaux messages, rafraîchir la liste + badge
            if (res.data!.length !== prev.length) {
              fetchConversations();
              refreshUnread();
            }
            return res.data!;
          });
        }
      } catch {
        // silencieux
      }
    };

    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [activeConv?.user.id]);

  // ── Ouvrir une conversation
  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    setMsgLoading(true);
    try {
      const res = await api.get<Message[]>(`/messages/conversation/${conv.user.id}`);
      if (res.success && res.data) setMessages(res.data);
      refreshUnread();
      fetchConversations();
    } catch {
      setMessages([]);
    } finally {
      setMsgLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // ── Envoyer un message
  const sendMessage = async () => {
    if (!activeConv || !input.trim() || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      const body: Record<string, unknown> = {
        receiverId: activeConv.user.id,
        content,
      };
      if (kookerContext) body.kookerRecipientId = kookerContext;

      const res = await api.post<Message>('/messages', body);
      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data!]);
        fetchConversations();
        refreshUnread();
      }
    } catch (err: any) {
      toast.error(err?.error || 'Erreur lors de l\'envoi');
      setInput(content);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // ── Demander confirmation avant suppression
  const handleDeleteMessage = (messageId: number) => {
    setPendingDelete({ type: 'message', id: messageId });
  };

  const handleDeleteConversation = (partnerId: number) => {
    setPendingDelete({ type: 'conversation', id: partnerId });
  };

  // ── Confirmer et exécuter la suppression
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.type === 'message') {
        await api.delete(`/messages/${pendingDelete.id}`);
        setMessages(prev => prev.filter(m => m.id !== pendingDelete.id));
        fetchConversations();
      } else {
        await api.delete(`/messages/conversation/${pendingDelete.id}`);
        setConversations(prev => prev.filter(c => c.user.id !== pendingDelete.id));
        if (activeConv?.user.id === pendingDelete.id) setActiveConv(null);
        refreshUnread();
      }
    } catch (err: any) {
      toast.error(err?.error || 'Erreur lors de la suppression');
    } finally {
      setPendingDelete(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Filtrage conversations pour les kookers
  const filteredConversations = user?.kookerProfileId
    ? conversations.filter(c => {
        const isKookerConv = c.kookerRecipientId === user.kookerProfileId;
        return kookerFilter === 'kooker' ? isKookerConv : !isKookerConv;
      })
    : conversations;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  document.title = 'Messages — Weekook';

  return (
    <div className="min-h-screen bg-[#f2f4fc]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="px-4 md:px-8 lg:px-[96px] py-6">

        <h1 className="text-[24px] md:text-[28px] font-bold text-[#111125] mb-6 tracking-[-0.5px]">
          Messages
        </h1>

        <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">

          {/* ════════ LISTE CONVERSATIONS ════════ */}
          <div className={`w-full lg:w-[340px] flex-shrink-0 bg-white rounded-[20px] border border-[#e0e0e0] shadow-sm flex flex-col overflow-hidden ${activeConv ? 'hidden lg:flex' : 'flex'}`}>

            {/* Filtre kooker/user */}
            {user?.kookerProfileId && (
              <div className="flex border-b border-[#e0e0e0]">
                <button
                  onClick={() => setKookerFilter('user')}
                  className={`flex-1 py-3 text-[13px] font-semibold transition-colors ${kookerFilter === 'user' ? 'text-[#c1a0fd] border-b-2 border-[#c1a0fd]' : 'text-[#6b7280] hover:text-[#111125]'}`}
                >
                  En tant qu'utilisateur
                </button>
                <button
                  onClick={() => setKookerFilter('kooker')}
                  className={`flex-1 py-3 text-[13px] font-semibold transition-colors ${kookerFilter === 'kooker' ? 'text-[#c1a0fd] border-b-2 border-[#c1a0fd]' : 'text-[#6b7280] hover:text-[#111125]'}`}
                >
                  En tant que Kooker
                </button>
              </div>
            )}

            {/* Liste */}
            <div className="flex-1 overflow-y-auto">
              {convLoading ? (
                <div className="flex flex-col gap-3 p-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 items-center animate-pulse">
                      <div className="w-11 h-11 rounded-full bg-[#e5e7eb] flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-[#e5e7eb] rounded w-1/2" />
                        <div className="h-3 bg-[#e5e7eb] rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#f3ecff] flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c1a0fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <p className="text-[14px] font-semibold text-[#111125] mb-1">Aucune conversation</p>
                  <p className="text-[13px] text-[#6b7280]">Contactez un kooker depuis sa fiche pour démarrer une discussion.</p>
                </div>
              ) : (
                filteredConversations.map(conv => (
                  <div
                    key={conv.user.id}
                    className={`conv-row relative flex items-center gap-3 px-4 py-3.5 border-b border-[#f0f0f0] last:border-0 transition-colors ${
                      activeConv?.user.id === conv.user.id ? 'bg-[#f3ecff]' : 'hover:bg-[#fafafa]'
                    }`}
                  >
                    <button
                      onClick={() => openConversation(conv)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar user={conv.user} size={44} />
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[14px] truncate ${conv.unreadCount > 0 ? 'font-bold text-[#111125]' : 'font-semibold text-[#111125]'}`}>
                            {conv.user.firstName} {conv.user.lastName}
                          </span>
                          <span className="text-[11px] text-[#9ca3af] flex-shrink-0">
                            {conv.lastMessage?.createdAt ? formatTime(conv.lastMessage.createdAt) : ''}
                          </span>
                        </div>
                        <p className={`text-[13px] truncate mt-0.5 ${conv.unreadCount > 0 ? 'font-medium text-[#374151]' : 'text-[#6b7280]'}`}>
                          {conv.lastMessage?.content || ''}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.user.id); }}
                      className="conv-delete-btn flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#fee2e2] text-[#9ca3af] hover:text-[#ef4444]"
                      title="Supprimer la conversation"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ════════ ZONE CHAT ════════ */}
          <div className={`flex-1 bg-white rounded-[20px] border border-[#e0e0e0] shadow-sm flex flex-col overflow-hidden ${activeConv ? 'flex' : 'hidden lg:flex'}`}>

            {activeConv ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e0e0e0] flex-shrink-0">
                  {/* Bouton retour mobile */}
                  <button
                    onClick={() => setActiveConv(null)}
                    className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f3ecff] transition-colors flex-shrink-0"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c1a0fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <Avatar user={activeConv.user} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#111125] truncate">
                      {activeConv.user.firstName} {activeConv.user.lastName}
                    </p>
                    {kookerContext && (
                      <p className="text-[12px] text-[#c1a0fd]">Via profil kooker</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
                  {msgLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#c1a0fd] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                      <div className="w-14 h-14 rounded-full bg-[#f3ecff] flex items-center justify-center mb-4">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c1a0fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <p className="text-[14px] font-semibold text-[#111125] mb-1">Démarrez la conversation</p>
                      <p className="text-[13px] text-[#6b7280]">Envoyez un premier message à {activeConv.user.firstName}</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id;
                        const showDate =
                          idx === 0 ||
                          new Date(msg.createdAt).toDateString() !==
                            new Date(messages[idx - 1].createdAt).toDateString();
                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="flex items-center gap-3 my-3">
                                <div className="flex-1 h-px bg-[#e5e7eb]" />
                                <span className="text-[11px] text-[#9ca3af] whitespace-nowrap">
                                  {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                                    weekday: 'long', day: 'numeric', month: 'long',
                                  })}
                                </span>
                                <div className="flex-1 h-px bg-[#e5e7eb]" />
                              </div>
                            )}
                            <div className={`msg-row flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                              {!isMe && <Avatar user={msg.sender} size={28} />}
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="msg-delete-btn flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#fee2e2] text-[#d1d5db] hover:text-[#ef4444] mb-5"
                                title="Supprimer"
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                </svg>
                              </button>
                              <div className="max-w-[70%]">
                                <div className={`px-4 py-2.5 rounded-[16px] text-[14px] leading-relaxed ${
                                  isMe
                                    ? 'bg-[#c1a0fd] text-white rounded-br-[4px]'
                                    : 'bg-[#f3f4f6] text-[#111125] rounded-bl-[4px]'
                                }`}>
                                  {msg.content}
                                </div>
                                <p className={`text-[10px] text-[#9ca3af] mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                  {formatFullTime(msg.createdAt)}
                                  {isMe && <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className="px-5 py-4 border-t border-[#e0e0e0] flex-shrink-0">
                  <div className="flex items-end gap-3">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Écrivez un message... (Entrée pour envoyer)"
                      rows={1}
                      className="flex-1 resize-none bg-[#f3f4f6] rounded-[12px] px-4 py-3 text-[14px] text-[#111125] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#c1a0fd] max-h-[120px] overflow-y-auto"
                      style={{ minHeight: '44px' }}
                      onInput={e => {
                        const t = e.target as HTMLTextAreaElement;
                        t.style.height = 'auto';
                        t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                      className="w-[44px] h-[44px] bg-[#c1a0fd] hover:bg-[#b090ed] disabled:opacity-40 rounded-[12px] flex items-center justify-center transition-all flex-shrink-0"
                      aria-label="Envoyer"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-1.5">Shift+Entrée pour un saut de ligne</p>
                </div>
              </>
            ) : (
              /* Placeholder — aucune conversation sélectionnée */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-[#f3ecff] flex items-center justify-center mb-5">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c1a0fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h2 className="text-[18px] font-bold text-[#111125] mb-2">Vos messages</h2>
                <p className="text-[14px] text-[#6b7280] max-w-[300px] leading-relaxed">
                  Sélectionnez une conversation à gauche ou contactez un kooker depuis sa fiche de profil.
                </p>
                <button
                  onClick={() => navigate('/recherche')}
                  className="mt-6 px-5 py-2.5 bg-[#c1a0fd] text-white font-semibold text-[14px] rounded-[12px] hover:bg-[#b090ed] transition-all"
                >
                  Trouver un kooker
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ════════ MODAL CONFIRMATION SUPPRESSION ════════ */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fee2e2] mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <h3 className="text-[17px] font-bold text-[#111125] text-center mb-2">
              {pendingDelete.type === 'message' ? 'Supprimer ce message ?' : 'Supprimer cette conversation ?'}
            </h3>
            <p className="text-[13px] text-[#6b7280] text-center mb-6">
              {pendingDelete.type === 'message'
                ? 'Ce message sera définitivement supprimé.'
                : 'Tous les messages de cette conversation seront définitivement supprimés.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2.5 rounded-[12px] border border-[#e5e7eb] text-[14px] font-semibold text-[#374151] hover:bg-[#f9fafb] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-[12px] bg-[#ef4444] text-white text-[14px] font-semibold hover:bg-[#dc2626] transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
