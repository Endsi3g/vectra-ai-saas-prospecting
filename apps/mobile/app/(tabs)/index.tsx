import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Zap, Users, Send, TrendingUp, Play } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeDate } from '@workspace/core/utils';
import type { ActivityLog } from '@workspace/core/types';

interface Stats {
  leads: number;
  campaigns: number;
  messages: number;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ leads: 0, campaigns: 0, messages: 0 });
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentRunning, setAgentRunning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const [leadsRes, campaignsRes, messagesRes, activityRes] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true }),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    setStats({
      leads: leadsRes.count ?? 0,
      campaigns: campaignsRes.count ?? 0,
      messages: messagesRes.count ?? 0,
    });
    setActivity((activityRes.data as ActivityLog[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadData(); }, []);

  async function launchHermesCycle() {
    setAgentRunning(true);
    try {
      const siteUrl = process.env.EXPO_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${siteUrl}/api/agents/hermes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });
      if (!resp.ok) throw new Error('Erreur agent');
      const result = await resp.json() as { leads_found?: number };
      Alert.alert(
        'Cycle lancé !',
        `Hermes a trouvé ${result.leads_found ?? 0} nouveau(x) lead(s).`,
      );
      loadData();
    } catch {
      Alert.alert('Erreur', 'Impossible de lancer le cycle Hermes.');
    } finally {
      setAgentRunning(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#3b82f6" />}
    >
      {/* Header */}
      <View className="px-5 pt-16 pb-4">
        <Text className="text-2xl font-bold text-foreground">Dashboard</Text>
        <Text className="text-muted-foreground text-sm mt-0.5">Bonjour 👋</Text>
      </View>

      {/* Stats */}
      <View className="flex-row gap-3 px-5 mb-5">
        <StatCard icon={<Users size={16} color="#3b82f6" />} label="Leads" value={stats.leads} />
        <StatCard icon={<Send size={16} color="#22c55e" />} label="Campagnes" value={stats.campaigns} />
        <StatCard icon={<TrendingUp size={16} color="#a855f7" />} label="Approuvés" value={stats.messages} />
      </View>

      {/* Agent Action */}
      <View className="mx-5 mb-5">
        <TouchableOpacity
          onPress={launchHermesCycle}
          disabled={agentRunning}
          className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2"
        >
          {agentRunning ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Play size={18} color="#fff" fill="#fff" />
          )}
          <Text className="text-white font-semibold text-base">
            {agentRunning ? 'Hermes en cours...' : 'Lancer un cycle Hermes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Activity Feed */}
      <View className="px-5">
        <Text className="text-sm font-semibold text-foreground mb-3">Activité récente</Text>
        {activity.length === 0 ? (
          <Text className="text-muted-foreground text-sm">Aucune activité récente.</Text>
        ) : (
          <View className="bg-card rounded-2xl divide-y divide-border overflow-hidden">
            {activity.map((log) => (
              <View key={log.id} className="px-4 py-3 flex-row items-start gap-3">
                <View className="h-7 w-7 rounded-full bg-zinc-800 items-center justify-center shrink-0 mt-0.5">
                  <Zap size={12} color="#a1a1aa" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-foreground" numberOfLines={2}>
                    {log.description}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeDate(log.created_at)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <View className="flex-1 bg-card rounded-2xl p-3.5 border border-border">
      <View className="mb-2">{icon}</View>
      <Text className="text-xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground mt-0.5">{label}</Text>
    </View>
  );
}
