import { EntryInput } from '@coop/shared';
import { api } from './api';

export interface PendingEntry {
  localId: string;
  data: EntryInput;
  createdAt: number;
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}

const DB_NAME = 'coop_offline_db';
const STORE_NAME = 'pending_entries';
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineEntry(data: EntryInput): Promise<string> {
  const db = await getDB();
  const localId = 'pending_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const item: PendingEntry = {
    localId,
    data,
    createdAt: Date.now(),
    status: 'pending'
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(item);
    req.onsuccess = () => {
      window.dispatchEvent(new CustomEvent('coop:offline-changed'));
      resolve(localId);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingEntries(): Promise<PendingEntry[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function removePendingEntry(localId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(localId);
    req.onsuccess = () => {
      window.dispatchEvent(new CustomEvent('coop:offline-changed'));
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function syncPendingEntries(): Promise<{ success: number; failed: number }> {
  if (!navigator.onLine) {
    return { success: 0, failed: 0 };
  }

  const items = await getPendingEntries();
  if (items.length === 0) return { success: 0, failed: 0 };

  let successCount = 0;
  let failCount = 0;

  for (const item of items) {
    try {
      await api.post('/entries', item.data);
      await removePendingEntry(item.localId);
      successCount++;
    } catch {
      failCount++;
    }
  }

  window.dispatchEvent(new CustomEvent('coop:offline-changed'));
  return { success: successCount, failed: failCount };
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncPendingEntries().catch(() => {});
  });
}
