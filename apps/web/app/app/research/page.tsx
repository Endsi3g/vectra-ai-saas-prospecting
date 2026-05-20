'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { SearchCode, Search, Globe, FileText, Cpu } from 'lucide-react';

export default function ResearchToolsPage() {
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
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Sources d'analyse et de recherche IA</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Découvrez les moteurs d'intelligence que Vectra utilise en arrière-plan pour scanner les sites Web et les profils de vos prospects afin d'assurer un score de personnalisation optimal.
          </p>
        </div>

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
