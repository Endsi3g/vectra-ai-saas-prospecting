'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { supabase } from '@/lib/supabase';
import { Settings, Save, Check, User, ShieldAlert, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [tone, setTone] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/sign-in');
        return;
      }
      setUserEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setBusinessType(profile.business_type || '');
        setLanguages(profile.preferred_languages || []);
        setTone(profile.tone || 'professional');
      }
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleLanguageToggle = (lang: string) => {
    setLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            business_type: businessType,
            preferred_languages: languages,
            tone: tone
          })
          .eq('id', user.id);

        if (error) throw error;
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 select-none">
          <span>Settings</span>
          <span className="text-zinc-300 dark:text-zinc-700 font-normal">/</span>
          <span className="font-semibold text-zinc-900 dark:text-white">Workspace Settings</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl">
        {loading ? (
          <div className="text-sm text-zinc-500 py-10">Chargement des paramètres...</div>
        ) : (
          <div className="space-y-6">
            
            {/* User Account Info */}
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-zinc-400" /> Profil Utilisateur
                </CardTitle>
                <CardDescription>Vos coordonnées de connexion de compte.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>Adresse e-mail</Label>
                  <Input value={userEmail} disabled className="bg-zinc-50 dark:bg-zinc-900" />
                </div>
              </CardContent>
            </Card>

            {/* Campaign Defaults settings */}
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-zinc-400" /> Configuration de l'IA (Onboarding)
                </CardTitle>
                <CardDescription>Modifier les préférences globales d'écriture de l'IA.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Business Type */}
                <div className="space-y-2">
                  <Label htmlFor="set-bus">Type d'activité / Positionnement</Label>
                  <Input 
                    id="set-bus" 
                    value={businessType} 
                    onChange={(e) => setBusinessType(e.target.value)} 
                    placeholder="Ex: SaaS early-stage, freelance designer, agence marketing..."
                  />
                </div>

                {/* Tone */}
                <div className="space-y-2">
                  <Label>Tonalité par défaut des messages</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['friendly', 'professional', 'formal'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`flex h-10 items-center justify-center rounded-lg border text-xs font-semibold capitalize transition-all ${
                          tone === t
                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                            : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                        }`}
                      >
                        {t === 'friendly' ? 'Amical' : t === 'professional' ? 'Professionnel' : 'Formel'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label>Langues de rédaction préférées</Label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleLanguageToggle('fr')}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${
                        languages.includes('fr')
                          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                          : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                      }`}
                    >
                      🇫🇷 Français
                    </button>
                    <button
                      onClick={() => handleLanguageToggle('en')}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${
                        languages.includes('en')
                          ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                          : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
                      }`}
                    >
                      🇬🇧 Anglais
                    </button>
                  </div>
                </div>

              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <span className="text-xs text-zinc-400">
                  Ces valeurs servent de préréglages lors du lancement de vos prospections.
                </span>
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/95 text-white gap-2">
                  {success ? (
                    <>
                      <Check className="h-4 w-4" /> Sauvegardé
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Trial limits card */}
            <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/10">
              <CardContent className="p-4 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Version Alpha Gratuite Activer</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Votre période d'essai est actuellement active. Vous êtes limité à un maximum de 50 leads par campagne de prospection. Les formules payantes seront disponibles prochainement.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
