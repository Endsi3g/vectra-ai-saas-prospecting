'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Badge } from '@workspace/ui/components/badge';
import { supabase } from '@/lib/supabase';
import { Settings, Save, Check, User, ShieldAlert, Sparkles, CreditCard, Loader2, ArrowUpRight } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [tone, setTone] = useState('');
  const [success, setSuccess] = useState(false);

  // Billing states
  const [plan, setPlan] = useState('alpha_free');
  const [creditsCount, setCreditsCount] = useState(2000);
  const [creditsLimit, setCreditsLimit] = useState(2000);

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
        setPlan(profile.plan || 'alpha_free');
        setCreditsCount(profile.credits_count !== undefined ? profile.credits_count : 2000);
        setCreditsLimit(profile.credits_limit !== undefined ? profile.credits_limit : 2000);
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

  const handleUpgrade = async (selectedPlan: string) => {
    setBillingLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: selectedPlan })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Upgrade redirect error:', err);
    } finally {
      setBillingLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Portal redirect error:', err);
    } finally {
      setBillingLoading(false);
    }
  };

  const getPlanLabel = (planId: string) => {
    if (planId === 'solo') return 'Solo Pro';
    if (planId === 'agency') return 'Agency Premium';
    return 'Alpha Free';
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

            {/* Premium Billing Section */}
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-zinc-400" /> Facturation & Abonnement
                  </CardTitle>
                  <Badge variant={plan !== 'alpha_free' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold">
                    Plan {getPlanLabel(plan)}
                  </Badge>
                </div>
                <CardDescription>Gérez votre forfait, vos factures et suivez l'allocation de vos crédits de sourcing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Credit usage meter */}
                <div className="space-y-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-500">Crédits restants</span>
                    <span className="text-zinc-900">{creditsCount.toLocaleString()} / {creditsLimit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(0, (creditsCount / (creditsLimit || 1)) * 100))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 block pt-1">
                    Les crédits de recherche sont réinitialisés et débités de 5 crédits par lead qualifié.
                  </span>
                </div>

                {/* Subscriptions Options context */}
                {plan === 'alpha_free' ? (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Plans Disponibles</span>
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Solo Card */}
                      <div className="border border-zinc-200 rounded-xl p-4 bg-white flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900">Solo Pro</h4>
                          <span className="text-xs text-zinc-400 block mt-1">Idéal pour freelances & solopreneurs</span>
                          <span className="text-lg font-bold text-primary block mt-2">49 € <span className="text-[10px] font-normal text-zinc-400">/ mois</span></span>
                          <ul className="text-[10px] text-zinc-500 space-y-1 mt-3">
                            <li className="flex items-center gap-1">✓ 5 000 crédits de sourcing</li>
                            <li className="flex items-center gap-1">✓ Pitchs illimités</li>
                            <li className="flex items-center gap-1">✓ Intégration Resend</li>
                          </ul>
                        </div>
                        <Button 
                          onClick={() => handleUpgrade('solo')} 
                          disabled={billingLoading}
                          className="w-full text-xs font-bold mt-2" 
                          size="sm"
                        >
                          {billingLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'S\'abonner Pro'}
                        </Button>
                      </div>

                      {/* Agency Card */}
                      <div className="border border-zinc-200 rounded-xl p-4 bg-white flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900">Agency Premium</h4>
                          <span className="text-xs text-zinc-400 block mt-1">Idéal pour agences & startups</span>
                          <span className="text-lg font-bold text-primary block mt-2">149 € <span className="text-[10px] font-normal text-zinc-400">/ mois</span></span>
                          <ul className="text-[10px] text-zinc-500 space-y-1 mt-3">
                            <li className="flex items-center gap-1">✓ 20 000 crédits de sourcing</li>
                            <li className="flex items-center gap-1">✓ Support prioritaire</li>
                            <li className="flex items-center gap-1">✓ Exports CSV illimités</li>
                          </ul>
                        </div>
                        <Button 
                          onClick={() => handleUpgrade('agency')} 
                          disabled={billingLoading}
                          variant="secondary"
                          className="w-full text-xs font-bold mt-2 border-zinc-200" 
                          size="sm"
                        >
                          {billingLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'S\'abonner Premium'}
                        </Button>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="pt-2 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">Abonnement Actif</span>
                      <span className="text-[11px] text-emerald-800 leading-relaxed block mt-0.5">
                        Votre formule de niveau <strong>{getPlanLabel(plan)}</strong> est configurée et active sur Stripe.
                      </span>
                    </div>
                    <Button 
                      onClick={handleManageBilling} 
                      disabled={billingLoading} 
                      variant="outline" 
                      className="border-emerald-200 hover:bg-emerald-100 text-emerald-800 bg-white text-xs font-semibold gap-1.5 shrink-0"
                    >
                      {billingLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          Gérer la facturation <ArrowUpRight className="h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Trial limits warning details (shown on Free Plan only) */}
            {plan === 'alpha_free' && (
              <Card className="border-amber-200 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/10">
                <CardContent className="p-4 flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Version Alpha Gratuite Activée</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Votre période d'essai est actuellement active. Vous disposez de {creditsCount} crédits gratuits. Pour débloquer les limites et synchroniser vos campagnes Stripe réelles, choisissez l'un des abonnements ci-dessus.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
