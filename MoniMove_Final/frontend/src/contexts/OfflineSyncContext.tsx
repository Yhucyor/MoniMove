'use client';

/**
 * OfflineSyncContext — singleton context cho offline sync state
 * Chỉ một instance của useOfflineSync chạy (trong OfflineSyncProvider)
 * Các component khác đọc state qua useOfflineSyncState()
 */

import { createContext, useContext, ReactNode } from 'react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { CachedAlert } from '../services/offlineStorage';

interface OfflineSyncState {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncAt: number | null;
    cachedDeviceCount: number;
    syncData: () => Promise<void>;
    getCachedAlerts: () => Promise<CachedAlert[]>;
}

const OfflineSyncContext = createContext<OfflineSyncState | null>(null);

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
    const syncState = useOfflineSync();
    return (
        <OfflineSyncContext.Provider value={syncState}>
            {children}
        </OfflineSyncContext.Provider>
    );
}

export function useOfflineSyncState(): OfflineSyncState {
    const ctx = useContext(OfflineSyncContext);
    if (!ctx) throw new Error('useOfflineSyncState requires OfflineSyncProvider');
    return ctx;
}
