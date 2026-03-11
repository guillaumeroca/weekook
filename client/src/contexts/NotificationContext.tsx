import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadCount: number;
  refreshUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnread: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCountRef = useRef(0);
  const initialLoadDoneRef = useRef(false);

  const refreshUnread = async () => {
    if (!user) { setUnreadCount(0); return; }
    try {
      const res = await api.get<{ count: number }>('/messages/unread-count');
      if (res.success && res.data) {
        const newCount = res.data.count;
        if (initialLoadDoneRef.current && newCount > prevCountRef.current) {
          toast.info('Nouveau message reçu', {
            description: 'Consultez vos messages pour voir les détails.',
            action: { label: 'Voir', onClick: () => navigate('/messages') },
            duration: 6000,
          });
        }
        prevCountRef.current = newCount;
        initialLoadDoneRef.current = true;
        setUnreadCount(newCount);
      }
    } catch {
      // silencieux
    }
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      initialLoadDoneRef.current = false;
      prevCountRef.current = 0;
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    refreshUnread();
    intervalRef.current = setInterval(refreshUnread, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
