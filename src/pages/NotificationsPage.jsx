import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';

function formatDateTime(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '-';
  }
}

function NotificationItem({ item, isUnread }) {
  const agenceLabel = item?.agence?.nom
    ? `${item.agence.nom}${item.agence.code ? ` (${item.agence.code})` : ''}`
    : null;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
        isUnread
          ? 'bg-blue-50/50 border-blue-200'
          : 'bg-white border-gray-200 hover:border-comar-royal/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-comar-navy">{item.title}</h3>
          <p className="text-xs sm:text-sm text-comar-gray-text mt-1 leading-relaxed">{item.message}</p>
        </div>
        {isUnread && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-comar-royal text-white shrink-0">
            Nouveau
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-comar-gray-text">
        <p>
          <span className="font-semibold text-comar-navy">Demande:</span>{' '}
          {item.request_number || '-'}
        </p>
        <p>
          <span className="font-semibold text-comar-navy">Police:</span>{' '}
          {item.police_number || '-'}
        </p>
        <p>
          <span className="font-semibold text-comar-navy">Date:</span>{' '}
          {formatDateTime(item.created_at)}
        </p>
        {agenceLabel && (
          <p>
            <span className="font-semibold text-comar-navy">Agence:</span> {agenceLabel}
          </p>
        )}
      </div>

      {item.dossier_id && (
        <div className="mt-4">
          <Link
            to={`/request-details/${item.dossier_id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-comar-royal hover:text-comar-navy transition-colors"
          >
            Voir le dossier
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAllAsRead,
    lastSeenAt,
  } = useNotifications();

  const lastSeenTimestamp = useMemo(() => {
    if (!lastSeenAt) return null;
    const ts = new Date(lastSeenAt).getTime();
    return Number.isNaN(ts) ? null : ts;
  }, [lastSeenAt]);

  const isUnread = (notification) => {
    if (!lastSeenTimestamp) return true;
    const createdAt = new Date(notification.created_at).getTime();
    if (Number.isNaN(createdAt)) return true;
    return createdAt > lastSeenTimestamp;
  };

  return (
    <div className="min-h-screen bg-comar-gray-bg pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-comar-navy">Mes Notifications</h1>
            <p className="text-sm text-comar-gray-text mt-1">
              {notifications.length} notification(s), {unreadCount} non lue(s)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshNotifications()}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-comar-border text-comar-navy hover:bg-white disabled:opacity-60"
            >
              Actualiser
            </button>
            <button
              onClick={markAllAsRead}
              disabled={!notifications.length || unreadCount === 0}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-comar-royal text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Marquer tout lu
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-comar-red">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-14">
            <div className="w-8 h-8 border-4 border-comar-border border-t-comar-royal rounded-full animate-spin mx-auto mb-3" />
            <p className="text-comar-gray-text">Chargement des notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-comar-gray-text">Aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                item={notification}
                isUnread={isUnread(notification)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
