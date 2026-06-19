const DB_NAME = 'monimove_offline';
const DB_VERSION = 1;

export interface CachedDevice {
  id: string;
  name: string;
  status: string;
  connectionStatus: string;
  battery?: number;
  lastUpdate?: number;
  lat?: number;
  lng?: number;
  cachedAt: number;
}

export interface CachedAlert {
  id: string;
  deviceId: string;
  alertType: string;
  message: string;
  timestamp: number;
  cachedAt: number;
}

export interface PendingAlert {
  id: string;
  deviceId: string;
  alertType: string;
  message: string;
  timestamp: number;
  createdAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('devices')) {
        db.createObjectStore('devices', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('alerts')) {
        db.createObjectStore('alerts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingAlerts')) {
        db.createObjectStore('pendingAlerts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('positions')) {
        const store = db.createObjectStore('positions', { keyPath: 'id' });
        store.createIndex('deviceId', 'deviceId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = fn(store);
    tx.oncomplete = () => resolve(result instanceof IDBRequest ? undefined : undefined);
    tx.onerror = () => reject(tx.error);
    if (result instanceof IDBRequest) {
      result.onsuccess = () => resolve(result.result);
      result.onerror = () => reject(result.error);
    }
  });
}

export async function cacheDevices(devices: CachedDevice[]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction('devices', 'readwrite');
  const store = tx.objectStore('devices');
  devices.forEach((d) => store.put(d));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedDevices(): Promise<CachedDevice[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('devices', 'readonly');
    const req = tx.objectStore('devices').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function cacheAlerts(alerts: CachedAlert[]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction('alerts', 'readwrite');
  const store = tx.objectStore('alerts');
  alerts.forEach((a) => store.put(a));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedAlerts(): Promise<CachedAlert[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('alerts', 'readonly');
    const req = tx.objectStore('alerts').getAll();
    req.onsuccess = () => {
      const items = (req.result || []) as CachedAlert[];
      resolve(items.sort((a, b) => b.timestamp - a.timestamp));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function cachePositions(
  deviceId: string,
  positions: { lat: number; lng: number; timestamp: number; speed?: number }[],
): Promise<void> {
  const db = await openDb();
  const tx = db.transaction('positions', 'readwrite');
  const store = tx.objectStore('positions');
  positions.forEach((p) =>
    store.put({ id: `${deviceId}_${p.timestamp}`, deviceId, ...p, cachedAt: Date.now() }),
  );
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedPositions(deviceId: string): Promise<
  { lat: number; lng: number; timestamp: number; speed?: number }[]
> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('positions', 'readonly');
    const index = tx.objectStore('positions').index('deviceId');
    const req = index.getAll(deviceId);
    req.onsuccess = () => {
      const items = (req.result || []) as { lat: number; lng: number; timestamp: number; speed?: number }[];
      resolve(items.sort((a, b) => b.timestamp - a.timestamp));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function queuePendingAlert(alert: Omit<PendingAlert, 'id' | 'createdAt'>): Promise<string> {
  const id = `pending_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const item: PendingAlert = { ...alert, id, createdAt: Date.now() };
  await withStore('pendingAlerts', 'readwrite', (store) => store.put(item));
  return id;
}

export async function getPendingAlerts(): Promise<PendingAlert[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingAlerts', 'readonly');
    const req = tx.objectStore('pendingAlerts').getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function removePendingAlert(id: string): Promise<void> {
  await withStore('pendingAlerts', 'readwrite', (store) => store.delete(id));
}

export function isBrowserOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
