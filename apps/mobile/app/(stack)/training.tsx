import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Mic, MicOff, Send } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function TrainingScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    Audio.requestPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Le microphone est nécessaire pour le training vocal.');
      }
    });
    // Initial message from persona
    setMessages([{
      role: 'assistant',
      content: "Bonjour, je suis Marie Dupont, directrice des opérations chez TechCorp. Qu'est-ce que je peux faire pour vous ?",
    }]);
  }, []);

  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(rec);
    } catch {
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement.');
    }
  }

  async function stopRecordingAndSend() {
    if (!recording) return;
    setLoading(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) throw new Error('No recording URI');

      // Transcribe via Whisper (via our API route)
      const siteUrl = process.env.EXPO_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as unknown as Blob);

      const transcribeResp = await fetch(`${siteUrl}/api/training/transcribe`, {
        method: 'POST',
        body: formData,
      });

      let userText = '';
      if (transcribeResp.ok) {
        const data = await transcribeResp.json() as { text?: string };
        userText = data.text ?? '';
      } else {
        // Fallback: ask user to type (graceful degradation)
        setLoading(false);
        return;
      }

      if (!userText.trim()) { setLoading(false); return; }

      const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
      setMessages(newMessages);
      scrollRef.current?.scrollToEnd({ animated: true });

      // Get AI response
      const chatResp = await fetch(`${siteUrl}/api/training/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          session_id: sessionId,
          persona: 'directeur_ops',
          difficulty: 'medium',
        }),
      });

      if (chatResp.ok) {
        const chatData = await chatResp.json() as { message?: string };
        if (chatData.message) {
          setMessages((prev) => [...prev, { role: 'assistant', content: chatData.message! }]);
          scrollRef.current?.scrollToEnd({ animated: true });
        }
      }
    } catch {
      Alert.alert('Erreur', 'Problème lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-16 pb-4 flex-row items-center gap-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#a1a1aa" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">Training Cold Call</Text>
          <Text className="text-xs text-muted-foreground">Persona : Directeur Ops</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            className={`mb-3 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
          >
            <View
              className={`rounded-2xl px-4 py-3 ${
                msg.role === 'user' ? 'bg-primary' : 'bg-card border border-border'
              }`}
            >
              <Text
                className={`text-sm leading-relaxed ${
                  msg.role === 'user' ? 'text-white' : 'text-foreground'
                }`}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View className="self-start bg-card border border-border rounded-2xl px-4 py-3">
            <ActivityIndicator size="small" color="#a1a1aa" />
          </View>
        )}
      </ScrollView>

      {/* Mic button */}
      <View className="px-5 py-5 border-t border-border items-center">
        <TouchableOpacity
          onPress={recording ? stopRecordingAndSend : startRecording}
          disabled={loading}
          className={`h-16 w-16 rounded-full items-center justify-center ${
            recording ? 'bg-red-500' : 'bg-primary'
          }`}
          style={{ opacity: loading ? 0.5 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : recording ? (
            <MicOff size={28} color="#fff" />
          ) : (
            <Mic size={28} color="#fff" />
          )}
        </TouchableOpacity>
        <Text className="text-xs text-muted-foreground mt-2">
          {recording ? 'Appuie pour envoyer' : 'Appuie pour parler'}
        </Text>
      </View>
    </View>
  );
}
