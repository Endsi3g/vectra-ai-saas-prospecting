import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function IntegrationsSettingsScreen() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-16 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#a1a1aa" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">Integrations</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="bg-card border border-border rounded-2xl p-5 items-center">
          <Text className="text-muted-foreground text-sm text-center">
            Gere les Integrations depuis l'app web pour les fonctionnalites completes.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
