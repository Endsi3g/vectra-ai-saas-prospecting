import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Search, Send, User, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface Candidate {
  name: string;
  role: string;
  company: string;
  location?: string;
  email?: string;
  match_score?: number;
  summary?: string;
  saved?: boolean;
}

export default function SourcingScreen() {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setCandidates([]);
    try {
      const siteUrl = process.env.EXPO_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const resp = await fetch(`${siteUrl}/api/sourcing/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), max_results: 5 }),
      });
      if (!resp.ok) throw new Error('Erreur sourcing');
      const data = await resp.json() as { candidates?: Candidate[] };
      setCandidates(data.candidates ?? []);
    } catch {
      Alert.alert('Erreur', 'Impossible de lancer la recherche.');
    } finally {
      setLoading(false);
    }
  }

  async function saveLead(candidate: Candidate, index: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get first campaign if none selected
      let campaignId = selectedCampaignId;
      if (!campaignId) {
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        campaignId = campaigns?.[0]?.id ?? '';
      }

      if (!campaignId) {
        Alert.alert('Erreur', 'Crée d\'abord une campagne.');
        return;
      }

      await supabase.from('leads').insert({
        campaign_id: campaignId,
        name: candidate.name,
        company: candidate.company,
        email: candidate.email ?? null,
        notes: candidate.summary ?? null,
      });

      setCandidates((prev) =>
        prev.map((c, i) => (i === index ? { ...c, saved: true } : c)),
      );
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder le lead.');
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View className="px-5 pt-16 pb-4">
        <Text className="text-2xl font-bold text-foreground">Sourcing</Text>
        <Text className="text-muted-foreground text-sm mt-0.5">Trouve tes prochains leads</Text>
      </View>

      {/* Search input */}
      <View className="px-5 mb-4 flex-row gap-3">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ex: CEO SaaS B2B Paris 50-200 salariés"
          placeholderTextColor="#52525b"
          multiline
          className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading || !query.trim()}
          className="bg-primary w-12 rounded-xl items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Send size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        {loading && (
          <View className="items-center py-10">
            <ActivityIndicator color="#3b82f6" />
            <Text className="text-muted-foreground text-sm mt-3">Hermes cherche...</Text>
          </View>
        )}
        {candidates.map((c, i) => (
          <View key={i} className="bg-card border border-border rounded-2xl p-4 mb-3">
            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 rounded-full bg-zinc-800 items-center justify-center shrink-0">
                <User size={18} color="#a1a1aa" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground font-semibold text-base">{c.name}</Text>
                  {c.match_score != null && (
                    <Text className="text-green-400 text-xs font-bold">{c.match_score}%</Text>
                  )}
                </View>
                <Text className="text-muted-foreground text-sm">{c.role} · {c.company}</Text>
                {c.location && (
                  <Text className="text-muted-foreground text-xs mt-0.5">{c.location}</Text>
                )}
                {c.summary && (
                  <Text className="text-zinc-400 text-xs mt-2 leading-relaxed" numberOfLines={3}>
                    {c.summary}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => !c.saved && saveLead(c, i)}
              disabled={c.saved}
              className={`mt-3 rounded-xl py-2.5 items-center flex-row justify-center gap-2 ${
                c.saved ? 'bg-green-500/20' : 'bg-primary/20'
              }`}
            >
              {c.saved ? (
                <>
                  <CheckCircle size={14} color="#22c55e" />
                  <Text className="text-green-400 text-sm font-medium">Sauvegardé</Text>
                </>
              ) : (
                <Text className="text-primary text-sm font-medium">+ Sauvegarder</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
