import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, CheckCircle, XCircle, Edit3 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import type { Message } from '@workspace/core/types';

export default function OutreachReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    // id is either a lead_id or message_id — query by lead
    supabase
      .from('messages')
      .select('*')
      .eq('lead_id', id)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMessages((data as Message[]) ?? []);
        setLoading(false);
      });
  }, [id]);

  async function updateStatus(messageId: string, status: 'approved' | 'discarded') {
    setProcessing(messageId);
    await supabase.from('messages').update({ status }).eq('id', messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    setProcessing(null);
  }

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-16 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#a1a1aa" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground flex-1">Review messages</Text>
        <Text className="text-sm text-muted-foreground">{messages.length} draft{messages.length !== 1 ? 's' : ''}</Text>
      </View>

      {messages.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <CheckCircle size={48} color="#22c55e" />
          <Text className="text-foreground font-semibold text-lg mt-4">Tout approuvé !</Text>
          <Text className="text-muted-foreground text-sm mt-1">Aucun message en attente.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
          {messages.map((msg) => (
            <View key={msg.id} className="bg-card border border-border rounded-2xl p-4 mb-4">
              {/* Subject */}
              <Text className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Objet</Text>
              <Text className="text-foreground font-medium text-sm mb-3">
                {msg.email_subject ?? 'Sans objet'}
              </Text>

              {/* Body */}
              <Text className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Corps</Text>
              <Text className="text-zinc-300 text-sm leading-relaxed mb-4">
                {msg.email_body ?? '—'}
              </Text>

              {/* Score */}
              {msg.personalization_score > 0 && (
                <View className="flex-row items-center mb-4">
                  <Text className="text-xs text-muted-foreground">Score personnalisation : </Text>
                  <Text className="text-xs font-bold text-green-400">{msg.personalization_score}%</Text>
                </View>
              )}

              {/* Actions */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => updateStatus(msg.id, 'discarded')}
                  disabled={processing === msg.id}
                  className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10"
                >
                  {processing === msg.id ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <>
                      <XCircle size={16} color="#ef4444" />
                      <Text className="text-red-400 text-sm font-medium">Refuser</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateStatus(msg.id, 'approved')}
                  disabled={processing === msg.id}
                  className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border border-green-500/30 bg-green-500/10"
                >
                  {processing === msg.id ? (
                    <ActivityIndicator size="small" color="#22c55e" />
                  ) : (
                    <>
                      <CheckCircle size={16} color="#22c55e" />
                      <Text className="text-green-400 text-sm font-medium">Approuver</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
