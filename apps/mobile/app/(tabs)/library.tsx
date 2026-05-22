import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { User, ChevronRight, Plus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { formatDate, initials, scoreColor } from '@workspace/core/utils';
import type { LeadWithFollow } from '@workspace/core/types';

export default function LibraryScreen() {
  const [leads, setLeads] = useState<LeadWithFollow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadLeads() {
    const { data } = await supabase
      .from('leads')
      .select('*, follow_ups(*)')
      .order('created_at', { ascending: false })
      .limit(50);
    setLeads((data as LeadWithFollow[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadLeads(); }, []);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-16 pb-4">
        <View>
          <Text className="text-2xl font-bold text-foreground">Library</Text>
          <Text className="text-muted-foreground text-sm mt-0.5">{leads.length} leads</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(stack)/campaigns/new')}
          className="h-9 w-9 bg-primary rounded-full items-center justify-center"
        >
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadLeads(); }} tintColor="#3b82f6" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(stack)/lead/${item.id}`)}
              className="bg-card border border-border rounded-2xl p-4 mb-3 flex-row items-center gap-3"
            >
              <View
                className="h-10 w-10 rounded-full items-center justify-center shrink-0"
                style={{ backgroundColor: '#27272a' }}
              >
                <Text className="text-foreground text-sm font-bold">{initials(item.name)}</Text>
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-foreground font-medium text-sm" numberOfLines={1}>
                  {item.name ?? 'Sans nom'}
                </Text>
                <Text className="text-muted-foreground text-xs mt-0.5" numberOfLines={1}>
                  {item.company ?? '—'}
                </Text>
              </View>
              {item.personalization_score != null && (
                <Text
                  className="text-xs font-bold shrink-0 mr-1"
                  style={{ color: scoreColor(item.personalization_score) }}
                >
                  {item.personalization_score}%
                </Text>
              )}
              <ChevronRight size={16} color="#52525b" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
