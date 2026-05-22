'use client';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, Link } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function SignInScreen() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Erreur', 'Email et mot de passe requis.');
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Connexion impossible', error.message);
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-foreground">Vectra</Text>
          <Text className="text-muted-foreground text-sm mt-1">Prospection IA</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor="#52525b"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-card border border-border rounded-xl px-4 py-3 text-foreground text-base"
            />
          </View>

          <View>
            <Text className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Mot de passe</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#52525b"
              secureTextEntry
              className="bg-card border border-border rounded-xl px-4 py-3 text-foreground text-base"
            />
          </View>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="bg-primary rounded-xl py-3.5 items-center mt-2"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Connexion</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted-foreground text-sm">Pas encore de compte ? </Text>
          <Link href="/auth/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-primary text-sm font-medium">Créer un compte</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
