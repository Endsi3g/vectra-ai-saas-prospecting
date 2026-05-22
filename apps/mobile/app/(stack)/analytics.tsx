import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, TrendingUp, Users, Mail, BarChart2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  totalLeads: number;
  totalCampaigns: number;
  messagesApproved: number;
  messagesDraft: number;
  messagesDiscarded: number;
  brevoStats?: { sent?: number; open_rate?: number; click_rate?: number };
  followUpByStatus: Record<string, number>;
}

export default function AnalyticsScreen() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const [leadsRes, campaignsRes, messagesRes, followUpsRes] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true }),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }),
      supabase.from('messages').select('status'),
      supabase.from('follow_ups').select('status'),
    ]);

    const messages = (messagesRes.data ?? []) as Array<{ status: string }>;
    const followUps = (followUpsRes.data ?? []) as Array<{ status: string }>;

    const followUpByStatus = followUps.reduce<Record<string, number>>((acc, fu) => {
      acc[fu.status] = (acc[fu.status] ?? 0) + 1;
      return acc;
    }, {});

    setData({
      totalLeads: leadsRes.count ?? 0,
      totalCampaigns: campaignsRes.count ?? 0,
      messagesApproved: messages.filter((m) => m.status === 'approved').length,
      messagesDraft: messages.filter((m) => m.status === 'draft').length,
      messagesDiscarded: messages.filter((m) => m.status === 'discarded').length,
      followUpByStatus,
    });
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadData(); }, []);

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
      contentContainerStyle={{ paddingBottom: 48 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#3b82f6" />}
    >
      {/* Header */}
      <View className="px-5 pt-16 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#a1a1aa" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Analytics</Text>
      </View>

      {data && (
        <>
          {/* KPI cards */}
          <View className="flex-row gap-3 px-5 mb-5">
            <KpiCard label="Leads" value={data.totalLeads} icon={<Users size={16} color="#3b82f6" />} />
            <KpiCard label="Campagnes" value={data.totalCampaigns} icon={<BarChart2 size={16} color="#a855f7" />} />
          </View>

          {/* Messages breakdown */}
          <View className="mx-5 mb-5 bg-card border border-border rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground mb-3">Messages</Text>
            <View className="space-y-2">
              <ProgressRow label="Approuvés" value={data.messagesApproved} total={data.messagesApproved + data.messagesDraft + data.messagesDiscarded} color="#22c55e" />
              <ProgressRow label="Drafts" value={data.messagesDraft} total={data.messagesApproved + data.messagesDraft + data.messagesDiscarded} color="#3b82f6" />
              <ProgressRow label="Refusés" value={data.messagesDiscarded} total={data.messagesApproved + data.messagesDraft + data.messagesDiscarded} color="#ef4444" />
            </View>
          </View>

          {/* Follow-up pipeline */}
          <View className="mx-5 mb-5 bg-card border border-border rounded-2xl p-4">
            <Text className="text-sm font-semibold text-foreground mb-3">Pipeline</Text>
            {Object.entries(data.followUpByStatus).map(([status, count]) => (
              <View key={status} className="flex-row justify-between py-1.5 border-b border-border last:border-0">
                <Text className="text-sm text-muted-foreground capitalize">{status.replace(/_/g, ' ')}</Text>
                <Text className="text-sm font-semibold text-foreground">{count}</Text>
              </View>
            ))}
            {Object.keys(data.followUpByStatus).length === 0 && (
              <Text className="text-muted-foreground text-sm">Aucun suivi enregistré.</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <View className="flex-1 bg-card border border-border rounded-2xl p-3.5">
      <View className="mb-2">{icon}</View>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <View className="mb-2">
      <View className="flex-row justify-between mb-1">
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-xs font-semibold text-foreground">{value} ({pct}%)</Text>
      </View>
      <View className="h-1.5 bg-zinc-800 rounded-full">
        <View className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}
