'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { SearchCode, Search, Globe, FileText, Cpu, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ResearchResult {
  name: string;
  company: string;
  website: string;
  email?: string;
  notes: string;
  role?: string;
}

export default function ResearchToolsPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const tools = [
    {
      name: 'Google Custom Search API',
      description: 'Recherche automatiquement les actualités et les communiqués de presse récents concernant le prospect.',
      icon: Search,
      source: 'Google API'
    },
    {
      name: 'Website Landing Parser',
      description: 'Scrape la page d\'accueil et extrait les méta-données, l\'offre de valeur et le ciblage marketing.',
      icon: Globe,
      source: 'Vectra Crawler'
    },
    {
      name: 'LinkedIn Profile Analyzer',
      description: 'Analyse les posts publics, l\'expérience et le profil professionnel du destinataire.',
      icon: SearchCode,
      source: 'LinkedIn Graph API'
    },
    {
      name: 'Financial Reports Parser',
      description: 'Extrait les rapports d\'activité pour identifier les enjeux prioritaires de croissance.',
      icon: FileText,
      source: 'OpenData & PDF'
    }
  ];

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/sourcing/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ query, limit: 3 })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.leads || []);
      }
    } catch (err) {
      console.error('Research error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 select-none">
          <span>Research</span>
          <span className="text-zinc-300 dark:text-zinc-700 font-normal">/</span>
          <span className="font-semibold text-zinc-900 dark:text-white">Tools</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-3xl space-y-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Recherche & Analyse IA de Prospects</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Entrez un nom, une entreprise ou une URL pour analyser un prospect en temps réel.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleResearch} className="max-w-2xl flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: SaaS founders in Montreal, coachs business en France..."
              className="pl-9 text-sm"
            />
          </div>
          <Button type="submit" disabled={isLoading || !query.trim()} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {isLoading ? 'Analyse...' : 'Rechercher'}
          </Button>
        </form>

        {/* Results */}
        {hasSearched && (
          <div className="max-w-4xl space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {isLoading ? 'Analyse en cours...' : `${results.length} résultat(s) trouvé(s)`}
            </h4>
            {isLoading && (
              <div className="flex items-center gap-3 text-sm text-zinc-500 p-4 bg-white border border-zinc-200 rounded-xl">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Vectra analyse les profils et enrichit les données...</span>
              </div>
            )}
            {!isLoading && results.length === 0 && (
              <div className="text-sm text-zinc-400 p-6 bg-white border border-dashed border-zinc-200 rounded-xl text-center">
                Aucun résultat trouvé. Essayez une requête différente.
              </div>
            )}
            {results.map((r, idx) => (
              <Card key={idx} className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900">{r.name}</span>
                      {r.role && <Badge variant="secondary" className="text-[10px]">{r.role}</Badge>}
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">{r.company}</p>
                    {r.notes && <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{r.notes}</p>}
                    {r.email && <p className="text-xs text-primary font-mono">{r.email}</p>}
                  </div>
                  {r.website && (
                    <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-primary transition-colors shrink-0">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sources info */}
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <Card key={t.name} className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">{t.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">{t.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">{t.source}</Badge>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="max-w-4xl bg-zinc-100 border border-zinc-200 p-4 rounded-xl dark:bg-zinc-900 dark:border-zinc-800 flex items-start gap-3">
          <Cpu className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Algorithme de Personalisation Score</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Chaque lead reçoit une note de pertinence sur 100 basée sur la fraîcheur de son activité en ligne, la clarté de son offre de valeur, et la correspondance avec vos critères d'approche définis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
