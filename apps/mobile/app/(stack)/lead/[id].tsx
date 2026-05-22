import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ChevronLeft,
  Mail,
  Phone,
  Linkedin,
  Globe,
  MapPin,
  Edit2,
  CheckCircle,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { initials, scoreColor, formatDate } from '@workspace/core/utils';
import type { LeadWithFollow, FollowUpStatus } from '@workspace/core/types';

const STATUS_LABELS: Record<FollowUpStatus, string> = {
  prospect: 'Prospect',
  qualifie: 'Qualifié',
  message_envoye: 'Message envoyé',
  reponse_recue: 'Réponse reçue',
  appel_planifie: 'Appel planifié',
  deal_conclu: 'Deal conclu',
};

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lead, setLead] = useState<LeadWithFollow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('leads')
      .select('*, follow_ups(*), messages(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setLead(data as LeadWithFollow | null);
        setLoading(false);
      });
  }, [id]);

  async function updateStatus(status: FollowUpStatus) {
    if (!lead) return;
    const followUp = Array.isArray(lead.follow_up) ? lead.follow_up[0] : lead.follow_up;

    if (followUp) {
      await supabase.from('follow_ups').update({ status }).eq('id', followUp.id);
    } else {
      await supabase.from('follow_ups').insert({ lead_id: lead.id, status });
    }
    setLead((prev) => prev ? { ...prev, follow_up: { ...followUp, status, lead_id: lead.id, id: followUp?.id ?? '', follow_up_date: null, notes: null, created_at: '' } } : prev);
  }

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  if (!lead) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-5">
        <Text className="text-muted-foreground">Lead introuvable</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const followUpStatus = Array.isArray(lead.follow_up) ? lead.follow_up[0]?.status : lead.follow_up?.status;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Header */}
      <View className="px-5 pt-16 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#a1a1aa" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground flex-1" numberOfLines={1}>
          {lead.name ?? 'Sans nom'}
        </Text>
      </View>

      {/* Profile card */}
      <View className="mx-5 bg-card border border-border rounded-2xl p-5 mb-4">
        <View className="flex-row items-center gap-4 mb-4">
          <View
            className="h-14 w-14 rounded-full items-center justify-center"
            style={{ backgroundColor: '#27272a' }}
          >
            <Text className="text-foreground text-lg font-bold">{initials(lead.name)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-foreground font-bold text-lg">{lead.name ?? '—'}</Text>
            <Text className="text-muted-foreground text-sm">{lead.role ?? '—'}</Text>
            <Text className="text-muted-foreground text-sm">{lead.company ?? '—'}</Text>
          </View>
          {lead.personalization_score != null && (
            <Text
              className="text-lg font-bold"
              style={{ color: scoreColor(lead.personalization_score) }}
            >
              {lead.personalization_score}%
            </Text>
          )}
        </View>

        {/* Contact actions */}
        <View className="flex-row gap-2 flex-wrap">
          {lead.email && (
            <ContactButton
              icon={<Mail size={14} color="#3b82f6" />}
              label={lead.email}
              onPress={() => Linking.openURL(`mailto:${lead.email}`)}
            />
          )}
          {lead.phone && (
            <ContactButton
              icon={<Phone size={14} color="#22c55e" />}
              label={lead.phone}
              onPress={() => Linking.openURL(`tel:${lead.phone}`)}
            />
          )}
          {lead.linkedin_url && (
            <ContactButton
              icon={<Linkedin size={14} color="#0ea5e9" />}
              label="LinkedIn"
              onPress={() => Linking.openURL(lead.linkedin_url!)}
            />
          )}
          {lead.website && (
            <ContactButton
              icon={<Globe size={14} color="#a855f7" />}
              label="Site web"
              onPress={() => Linking.openURL(lead.website!)}
            />
          )}
        </View>
      </View>

      {/* Follow-up status */}
      <View className="mx-5 mb-4">
        <Text className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">Statut</Text>
        <View className="flex-row flex-wrap gap-2">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => updateStatus(key as FollowUpStatus)}
              className={`px-3 py-1.5 rounded-full border ${
                followUpStatus === key
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              }`}
            >
              <Text
                className={`text-xs font-medium ${followUpStatus === key ? 'text-white' : 'text-muted-foreground'}`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      {lead.notes && (
        <View className="mx-5 mb-4 bg-card border border-border rounded-2xl p-4">
          <Text className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Notes</Text>
          <Text className="text-sm text-zinc-300 leading-relaxed">{lead.notes}</Text>
        </View>
      )}

      {/* Messages */}
      {Array.isArray(lead.messages) && lead.messages.length > 0 && (
        <View className="mx-5">
          <Text className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Messages ({lead.messages.length})
          </Text>
          <View className="bg-card border border-border rounded-2xl overflow-hidden">
            {lead.messages.map((msg, i) => (
              <View
                key={msg.id}
                className={`p-4 ${i < lead.messages!.length - 1 ? 'border-b border-border' : ''}`}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                    {msg.email_subject ?? 'Sans objet'}
                  </Text>
                  <View
                    className={`px-2 py-0.5 rounded-full ${
                      msg.status === 'approved'
                        ? 'bg-green-500/20'
                        : msg.status === 'draft'
                          ? 'bg-zinc-700'
                          : 'bg-red-500/20'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        msg.status === 'approved'
                          ? 'text-green-400'
                          : msg.status === 'draft'
                            ? 'text-zinc-400'
                            : 'text-red-400'
                      }`}
                    >
                      {msg.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-muted-foreground" numberOfLines={2}>
                  {msg.email_body ?? ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function ContactButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-1.5 bg-zinc-800 rounded-xl px-3 py-2"
    >
      {icon}
      <Text className="text-xs text-foreground" numberOfLines={1} style={{ maxWidth: 120 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
