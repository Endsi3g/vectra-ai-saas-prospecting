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
import { MessageSquare, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { formatRelativeDate } from '@workspace/core/utils';
import type { InboxConversation } from '@workspace/core/types';

type Filter = 'all' | 'interested' | 'objection';

const SENTIMENT_COLOR: Record<string, string> = {
  interested: '#22c55e',
  objection: '#f59e0b',
  unsubscribe: '#ef4444',
};

export default function InboxScreen() {
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadConversations() {
    let query = supabase
      .from('inbox_conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('sentiment', filter);
    }

    const { data } = await query;
    setConversations((data as InboxConversation[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadConversations(); }, [filter]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-16 pb-4">
        <Text className="text-2xl font-bold text-foreground">Inbox</Text>
      </View>

      {/* Filters */}
      <View className="flex-row gap-2 px-5 mb-4">
        {(['all', 'interested', 'objection'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full border ${
              filter === f
                ? 'bg-primary border-primary'
                : 'bg-transparent border-border'
            }`}
          >
            <Text className={`text-xs font-medium ${filter === f ? 'text-white' : 'text-muted-foreground'}`}>
              {f === 'all' ? 'Tous' : f === 'interested' ? 'Intéressés' : 'Objections'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadConversations(); }} tintColor="#3b82f6" />
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <MessageSquare size={32} color="#52525b" />
              <Text className="text-muted-foreground text-sm mt-3">Aucune conversation</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(stack)/outreach/${item.id}`)}
              className="bg-card border border-border rounded-2xl p-4 mb-3 flex-row items-center gap-3"
            >
              <View
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: SENTIMENT_COLOR[item.sentiment] ?? '#52525b' }}
              />
              <View className="flex-1 min-w-0">
                <Text className="text-foreground font-medium text-sm" numberOfLines={1}>
                  Conversation {item.id.slice(0, 8)}
                </Text>
                <Text className="text-muted-foreground text-xs mt-0.5">
                  {formatRelativeDate(item.last_message_at)}
                </Text>
              </View>
              <ChevronRight size={16} color="#52525b" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
