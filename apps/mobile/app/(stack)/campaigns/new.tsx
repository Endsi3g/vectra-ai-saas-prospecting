import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function NewCampaignScreen() {
  const [name, setName] = useState('');
  const [offer, setOffer] = useState('');
  const [icp, setIcp] = useState('');
  const [angle, setAngle] = useState('');
  const [cta, setCta] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom de la campagne est requis.');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase.from('campaigns').insert({
        user_id: user.id,
        name: name.trim(),
        offer: offer.trim() || null,
        icp: icp.trim() || null,
        angle: angle.trim() || null,
        call_to_action: cta.trim() || null,
      });

      if (error) throw error;
      Alert.alert('Campagne créée !', `"${name}" est prête.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de créer la campagne.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View className="px-5 pt-16 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#a1a1aa" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Nouvelle campagne</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <FormField label="Nom *" value={name} onChangeText={setName} placeholder="Ex: SaaS B2B France Q3" />
        <FormField label="Offre" value={offer} onChangeText={setOffer} placeholder="Ce que tu proposes..." multiline />
        <FormField label="ICP (Client idéal)" value={icp} onChangeText={setIcp} placeholder="CEO SaaS 50-500 salariés..." multiline />
        <FormField label="Angle" value={angle} onChangeText={setAngle} placeholder="Pain point principal..." multiline />
        <FormField label="CTA" value={cta} onChangeText={setCta} placeholder="Démo 20 min cette semaine ?" />

        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading || !name.trim()}
          className="bg-primary rounded-xl py-3.5 items-center mt-4"
          style={{ opacity: loading || !name.trim() ? 0.5 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Créer la campagne</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#52525b"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        className="bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm"
        style={multiline ? { textAlignVertical: 'top', minHeight: 80 } : {}}
      />
    </View>
  );
}
