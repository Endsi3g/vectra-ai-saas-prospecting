import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import {
  ChevronRight,
  User,
  Palette,
  Users,
  Mail,
  Plug,
  CreditCard,
  Key,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

interface SettingRow {
  label: string;
  icon: React.ReactNode;
  route?: string;
  onPress?: () => void;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    Alert.alert('Se déconnecter', 'Es-tu sûr(e) ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/sign-in');
        },
      },
    ]);
  }

  const sections: { title: string; rows: SettingRow[] }[] = [
    {
      title: 'Compte',
      rows: [
        {
          label: 'Branding',
          icon: <Palette size={18} color="#a1a1aa" />,
          route: '/(stack)/settings/branding',
        },
        {
          label: 'Membres',
          icon: <Users size={18} color="#a1a1aa" />,
          route: '/(stack)/settings/members',
        },
      ],
    },
    {
      title: 'Intégrations',
      rows: [
        {
          label: 'Boîtes mail',
          icon: <Mail size={18} color="#a1a1aa" />,
          route: '/(stack)/settings/mailboxes',
        },
        {
          label: 'Intégrations',
          icon: <Plug size={18} color="#a1a1aa" />,
          route: '/(stack)/settings/integrations',
        },
      ],
    },
    {
      title: 'Facturation',
      rows: [
        {
          label: 'Plans & Crédits',
          icon: <CreditCard size={18} color="#a1a1aa" />,
          route: '/(stack)/settings/plans',
        },
        {
          label: 'Clés API',
          icon: <Key size={18} color="#a1a1aa" />,
          route: '/(stack)/settings/api-mcp',
        },
      ],
    },
    {
      title: '',
      rows: [
        {
          label: 'Se déconnecter',
          icon: <LogOut size={18} color="#ef4444" />,
          onPress: handleSignOut,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View className="px-5 pt-16 pb-4">
        <Text className="text-2xl font-bold text-foreground">Settings</Text>
        {user?.email && (
          <Text className="text-muted-foreground text-sm mt-0.5">{user.email}</Text>
        )}
      </View>

      {sections.map((section, si) => (
        <View key={si} className="px-5 mb-5">
          {section.title ? (
            <Text className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">
              {section.title}
            </Text>
          ) : null}
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            {section.rows.map((row, ri) => (
              <TouchableOpacity
                key={ri}
                onPress={row.onPress ?? (() => row.route && router.push(row.route as never))}
                className={`flex-row items-center gap-3 px-4 py-3.5 ${
                  ri < section.rows.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <View className="w-6 items-center">{row.icon}</View>
                <Text
                  className={`flex-1 text-sm font-medium ${
                    row.destructive ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {row.label}
                </Text>
                {!row.destructive && <ChevronRight size={16} color="#52525b" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
