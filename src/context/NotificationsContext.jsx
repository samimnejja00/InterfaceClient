import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchClientNotifications } from '../services/clientApi';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

const LAST_SEEN_KEY_PREFIX = 'client_notifications_last_seen_';

function getLastSeenStorageKey(clientId) {
  return `${LAST_SEEN_KEY_PREFIX}${clientId}`;
}

function readLastSeen(clientId) {
  if (!clientId) return null;
  try {
    return localStorage.getItem(getLastSeenStorageKey(clientId));
  } catch {
    return null;
  }
}

function writeLastSeen(clientId, isoDateString) {
  if (!clientId) return;
  try {
    localStorage.setItem(getLastSeenStorageKey(clientId), isoDateString);
  } catch {
    // Ignore localStorage errors.
  }
}

export function NotificationsProvider({ children }) {
  const { isAuthenticated, client } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSeenAt, setLastSeenAt] = useState(null);

  const clientId = client?.id || null;

  useEffect(() => {
    if (!clientId) {
      setLastSeenAt(null);
      return;
    }

    setLastSeenAt(readLastSeen(clientId));
  }, [clientId]);

  const refreshNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!isAuthenticated || !clientId) {
      setNotifications([]);
      setError(null);
      return;
    }

    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await fetchClientNotifications({ limit: 100 });
      setNotifications(response?.data || []);
    } catch (fetchError) {
      const rawMessage = String(fetchError?.message || '');
      const normalizedMessage = rawMessage.toLowerCase();

      if (normalizedMessage.includes('route non trouv')) {
        setError("Notifications indisponibles pour le moment. Verifiez que l'API client est demarree et que REACT_APP_API_URL pointe vers /api.");
      } else {
        setError(rawMessage || 'Erreur de chargement des notifications.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [clientId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !clientId) {
      setNotifications([]);
      return;
    }

    refreshNotifications();

    const intervalId = setInterval(() => {
      refreshNotifications({ silent: true });
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [clientId, isAuthenticated, refreshNotifications]);

  const unreadCount = useMemo(() => {
    if (!notifications.length) return 0;

    if (!lastSeenAt) return notifications.length;

    const lastSeenTimestamp = new Date(lastSeenAt).getTime();
    if (Number.isNaN(lastSeenTimestamp)) return notifications.length;

    return notifications.filter((notification) => {
      const createdAt = new Date(notification.created_at).getTime();
      if (Number.isNaN(createdAt)) return true;
      return createdAt > lastSeenTimestamp;
    }).length;
  }, [lastSeenAt, notifications]);

  const markAllAsRead = useCallback(() => {
    if (!clientId) return;

    const now = new Date().toISOString();
    writeLastSeen(clientId, now);
    setLastSeenAt(now);
  }, [clientId]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAllAsRead,
    lastSeenAt,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
