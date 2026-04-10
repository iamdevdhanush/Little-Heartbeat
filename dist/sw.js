const CACHE_NAME = 'little-heartbeat-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls and external resources
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api') || 
      url.hostname !== self.location.hostname) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response for caching
        const responseClone = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-health-data') {
    event.waitUntil(syncHealthData());
  }
});

async function syncHealthData() {
  // Sync any queued health data when back online
  const data = await getQueuedData();
  for (const item of data) {
    try {
      await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      await removeQueuedData(item.id);
    } catch (e) {
      console.log('Sync failed, will retry later');
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/images/icon.png',
    badge: '/assets/images/badge.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for health reminders
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'health-reminder') {
    event.waitUntil(checkHealthReminder());
  }
});

async function checkHealthReminder() {
  // Check if it's time for a health reminder
  const lastReminder = localStorage.getItem('last_reminder');
  const now = Date.now();
  
  if (!lastReminder || now - parseInt(lastReminder) > 24 * 60 * 60 * 1000) {
    // More than 24 hours since last reminder
    self.registration.sync.register('sync-health-data');
    localStorage.setItem('last_reminder', now.toString());
  }
}

// Helper functions
async function getQueuedData() {
  const data = localStorage.getItem('queued_data');
  return data ? JSON.parse(data) : [];
}

async function removeQueuedData(id) {
  const data = await getQueuedData();
  const filtered = data.filter(item => item.id !== id);
  localStorage.setItem('queued_data', JSON.stringify(filtered));
}
