'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@workspace/ui/components/card';
import { 
  Bot, 
  Sparkles, 
  Settings, 
  FolderOpen, 
  Globe, 
  UserCheck, 
  Check, 
  Search, 
  Sliders, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { captureAnalyticsEvent } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';

interface CampaignItem {
  id: string;
  name: string;
}

export default function AgentsPage() {
  const router = useRouter();
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  
  // Agent activation states
  const [hermesActive, setHermesActive] = useState(true);
  const [apolloActive, setApolloActive] = useState(true);
  const [athenaActive, setAthenaActive] = useState(false);

  // Agent settings states
  const [matchThreshold, setMatchThreshold] = useState<number>(85);
  const [maxLeadsLimit, setMaxLeadsLimit] = useState<number>(20);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'manual'>('daily');
  const [outreachLanguage, setOutreachLanguage] = useState<'fr' | 'en' | 'bilingual'>('bilingual');
  const [defaultTone, setDefaultTone] = useState<'casual' | 'professional' | 'direct'>('professional');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchCampaignsList = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('campaigns')
            .select('id, name')
            .eq('user_id', user.id);
          
          if (!error && data && data.length > 0 && data[0]) {
            setCampaigns(data);
            setSelectedCampaignId(data[0].id);
          } else {
            // Mock fallback if empty or error
            setCampaigns([
              { id: 'camp-1', name: 'Audit Landing Page - Coachs Business B2B' },
              { id: 'camp-2', name: 'Modernisation Web - Agence Design' }
            ]);
            setSelectedCampaignId('camp-1');
          }
        }
      } catch (err) {
        console.error('Error fetching campaigns list in agents page:', err);
      } finally {
        setLoadingCampaigns(false);
      }
    };

    fetchCampaignsList();
  }, []);

  const handleSaveConfig = () => {
    setIsSaving(true);
    setSaveSuccess(false);

    captureAnalyticsEvent('agents_config_saved', {
      hermes_active: hermesActive,
      apollo_active: apolloActive,
      athena_active: athenaActive,
      match_threshold: matchThreshold,
      max_leads_limit: maxLeadsLimit,
      frequency,
      outreach_language: outreachLanguage,
      default_tone: defaultTone,
      campaign_id: selectedCampaignId
    });

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white text-zinc-950 font-sans">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500 select-none">
          <span className="hover:text-zinc-950 cursor-pointer transition-colors" onClick={() => router.push('/app')}>Agents</span>
          <span className="text-zinc-300 font-normal">/</span>
          <span className="font-semibold text-zinc-900">Workflows Orchestrator</span>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-pulse bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
              <Check className="h-3.5 w-3.5" />
              Configuration enregistrée !
            </span>
          )}
          <Button
            onClick={handleSaveConfig}
            disabled={isSaving}
            size="sm"
            className="bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg"
          >
            {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
          </Button>
        </div>
      </header>

      {/* Main configuration workspace */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAFA] p-6 space-y-6">
        
        {/* Top Info Banner */}
        <div className="max-w-5xl bg-zinc-50 border border-zinc-200 p-5 rounded-xl flex gap-3.5 items-start">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-zinc-900">Orchestrateur d'Agents Autonomes</h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl">
              Configurez vos copilotes d'IA pour automatiser la prospection de bout en bout. 
              Les agents travaillent silencieusement en arrière-plan pour scanner les sources de prospects, calculer leur score de correspondance avec votre offre, et préparer des e-mails hautement personnalisés.
            </p>
          </div>
        </div>

        {/* Configuration Split Grid */}
        <div className="grid gap-6 lg:grid-cols-3 max-w-5xl">
          
          {/* Section A: Agent Cards List (2 Columns / left & center) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider select-none">Agents Disponibles</h4>

            {/* Agent 1: Hermes */}
            <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-700">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-bold">Hermes (Sourcing Automatique)</CardTitle>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold">Autonome</Badge>
                    </div>
                    <CardDescription className="text-[11px] mt-1">
                      Scrape LinkedIn, Crunchbase et les annuaires d'entreprises selon vos filtres d'ICP.
                    </CardDescription>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => setHermesActive(!hermesActive)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hermesActive ? 'bg-primary' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      hermesActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </CardHeader>
              
              <CardContent className="text-[11px] text-zinc-500 border-t border-zinc-100 bg-[#FAFAFA]/50 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Source ciblée :</span>
                  <span className="font-semibold text-zinc-700">LinkedIn Graph API &amp; Google Maps API</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Vitesse de recherche :</span>
                  <span className="font-semibold text-zinc-700">10 à 50 prospects / cycle</span>
                </div>
              </CardContent>
            </Card>

            {/* Agent 2: Apollo */}
            <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-700">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-bold">Apollo (Analyse &amp; Personnalisation)</CardTitle>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold">Génération</Badge>
                    </div>
                    <CardDescription className="text-[11px] mt-1">
                      Scrape le site du prospect, identifie son offre de valeur, et rédige la première approche e-mail.
                    </CardDescription>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => setApolloActive(!apolloActive)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    apolloActive ? 'bg-primary' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      apolloActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </CardHeader>
              
              <CardContent className="text-[11px] text-zinc-500 border-t border-zinc-100 bg-[#FAFAFA]/50 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Modèle LLM de rédaction :</span>
                  <span className="font-semibold text-zinc-700">GPT-4.1 Nano Plus (Outbound Optimized)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Intégration d'angle :</span>
                  <span className="font-semibold text-zinc-700">Audit de site, Modernisation ou Diagnostic</span>
                </div>
              </CardContent>
            </Card>

            {/* Agent 3: Athena */}
            <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden opacity-80">
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-700">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-bold">Athena (Intelligence Sectorielle)</CardTitle>
                      <Badge variant="secondary" className="text-[9px] font-bold">Bêta</Badge>
                    </div>
                    <CardDescription className="text-[11px] mt-1">
                      Scanne les communiqués de presse et les réseaux sociaux des cibles pour identifier les opportunités.
                    </CardDescription>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => setAthenaActive(!athenaActive)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    athenaActive ? 'bg-primary' : 'bg-zinc-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      athenaActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </CardHeader>
              
              <CardContent className="text-[11px] text-zinc-500 border-t border-zinc-100 bg-[#FAFAFA]/50 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Fréquence d'actualisation :</span>
                  <span className="font-semibold text-zinc-700">Toutes les 24h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Triggers d'actualité :</span>
                  <span className="font-semibold text-zinc-700">Recrutements récents, Levées de fonds, Nouveaux produits</span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Section B: Parameters Configuration (1 Column / right) */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider select-none">Paramètres Globaux</h4>

            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-5 shadow-sm">
              
              {/* Campaign Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Campagne Cible</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-200 bg-[#FAFAFA] text-xs font-medium px-3 focus-visible:outline-none"
                >
                  {campaigns.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Match threshold slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Score de Match Minimum</label>
                  <span className="text-xs font-extrabold text-primary">{matchThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  value={matchThreshold}
                  onChange={(e) => setMatchThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-[9px] text-zinc-400 block leading-normal">
                  Seuls les prospects ayant un score de compatibilité ICP supérieur à cette limite seront sauvegardés.
                </span>
              </div>

              {/* Max daily credit usage limit */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Limite Quotidienne (Crédits)</label>
                <select
                  value={maxLeadsLimit.toString()}
                  onChange={(e) => setMaxLeadsLimit(parseInt(e.target.value))}
                  className="w-full h-9 rounded-lg border border-zinc-200 bg-[#FAFAFA] text-xs font-medium px-3 focus-visible:outline-none"
                >
                  <option value="10">Max 10 leads / jour</option>
                  <option value="20">Max 20 leads / jour</option>
                  <option value="50">Max 50 leads / jour</option>
                  <option value="100">Max 100 leads / jour</option>
                </select>
              </div>

              {/* Frequency selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Fréquence de Recherche</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-zinc-200 bg-[#FAFAFA] text-xs font-medium px-3 focus-visible:outline-none"
                >
                  <option value="daily">Quotidienne (Tous les matins à 8h)</option>
                  <option value="weekly">Hebdomadaire (Tous les Lundis)</option>
                  <option value="manual">Manuelle (Uniquement sur déclenchement)</option>
                </select>
              </div>

              {/* Language Preference */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Langue d'approche</label>
                <select
                  value={outreachLanguage}
                  onChange={(e) => setOutreachLanguage(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-zinc-200 bg-[#FAFAFA] text-xs font-medium px-3 focus-visible:outline-none"
                >
                  <option value="bilingual">Bilingue (Français et Anglais)</option>
                  <option value="fr">Français uniquement</option>
                  <option value="en">Anglais uniquement</option>
                </select>
              </div>

              {/* Tone Preference */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tonalité par défaut</label>
                <select
                  value={defaultTone}
                  onChange={(e) => setDefaultTone(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-zinc-200 bg-[#FAFAFA] text-xs font-medium px-3 focus-visible:outline-none"
                >
                  <option value="professional">Professionnelle (Constructive &amp; Polie)</option>
                  <option value="casual">Directe (Courte &amp; Dynamique)</option>
                  <option value="direct">Décontractée</option>
                </select>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
