import { useEffect, useState, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/lib/supabase';
import type { Lead, Campaign } from '@workspace/core/types';

const DB_NAME = 'vectra_cache.db';

async function getDb() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS leads_cache (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS campaigns_cache (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at INTEGER NOT NULL
    );
  `);
  return db;
}

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? true;
      setIsOnline(online);
      if (online) syncCache().catch(() => {});
    });
    return () => unsubscribe();
  }, []);

  const getLeads = useCallback(async (): Promise<Lead[]> => {
    if (isOnline) {
      const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(100);
      if (data) await cacheData('leads_cache', data as Lead[]);
      return (data as Lead[]) ?? [];
    }
    return readCache<Lead>('leads_cache');
  }, [isOnline]);

  const getCampaigns = useCallback(async (): Promise<Campaign[]> => {
    if (isOnline) {
      const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
      if (data) await cacheData('campaigns_cache', data as Campaign[]);
      return (data as Campaign[]) ?? [];
    }
    return readCache<Campaign>('campaigns_cache');
  }, [isOnline]);

  return { isOnline, getLeads, getCampaigns };
}

async function cacheData<T extends { id: string }>(table: string, items: T[]): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  for (const item of items) {
    await db.runAsync(
      `INSERT OR REPLACE INTO ${table} (id, data, cached_at) VALUES (?, ?, ?)`,
      [item.id, JSON.stringify(item), now],
    );
  }
}

async function readCache<T>(table: string): Promise<T[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ data: string }>(`SELECT data FROM ${table} ORDER BY cached_at DESC`);
  return rows.map((r) => JSON.parse(r.data) as T);
}

async function syncCache(): Promise<void> {
  const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(100);
  if (leads) await cacheData('leads_cache', leads as Array<{ id: string }>);
  const { data: campaigns } = await supabase.from('campaigns').select('*');
  if (campaigns) await cacheData('campaigns_cache', campaigns as Array<{ id: string }>);
}
