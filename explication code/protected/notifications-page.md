# NotificationsPage

## But et utilite

- But et utilite: Cette page affiche les notifications client et l'etat de lecture.

## Route

- /notifications (protected)

## Data flow

- Uses NotificationsContext
- refreshNotifications() calls fetchClientNotifications
- unreadCount based on lastSeenAt (localStorage)
- markAllAsRead only updates localStorage (last seen)

## API

- GET /api/notifications?limit=...

## Storage

- localStorage key: client_notifications_last_seen_<clientId>
