'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Link2, Mail, Database, Sparkles, CheckCircle2 } from 'lucide-react';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function IntegrationsPage() {
  const integrations = [
    {
      name: 'LinkedIn Direct Message',
      description: 'Permet de synchroniser votre compte LinkedIn pour envoyer automatiquement vos messages approuvés.',
      icon: LinkedinIcon,
      status: 'coming_soon',
      color: 'bg-blue-500'
    },
    {
      name: 'Cold Email SMTP / GSuite',
      description: 'Connectez votre serveur SMTP ou votre Google Workspace pour envoyer les e-mails de prospection.',
      icon: Mail,
      status: 'coming_soon',
      color: 'bg-emerald-500'
    },
    {
      name: 'Hubspot CRM',
      description: 'Exportez vos leads qualifiés et vos historiques d\'échanges directement dans Hubspot.',
      icon: Database,
      status: 'coming_soon',
      color: 'bg-orange-500'
    },
    {
      name: 'CSV Export Stream',
      description: 'Téléchargez vos prospects personnalisés au format CSV standard pour l\'import dans Lemlist, Waalaxy, etc.',
      icon: Link2,
      status: 'active',
      color: 'bg-primary'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 select-none">
          <span>Integrations</span>
          <span className="text-zinc-300 dark:text-zinc-700 font-normal">/</span>
          <span className="font-semibold text-zinc-900 dark:text-white">Channels</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-3xl space-y-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Connectez vos canaux de prospection</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Vectra génère des messages hautement personnalisés. Associez vos comptes professionnels pour fluidifier l'envoi ou exportez en un clic vers vos plateformes existantes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
          {integrations.map((int) => {
            const Icon = int.icon;
            const isActive = int.status === 'active';

            return (
              <Card key={int.name} className="border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`h-10 w-10 rounded-lg ${int.color} text-white flex items-center justify-center`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {isActive ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Actif
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-zinc-500">Bientôt</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold mt-4">{int.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">{int.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Button variant="outline" size="sm" className="w-full" disabled={!isActive}>
                    {isActive ? 'Gérer la connexion' : 'Me notifier de la sortie'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
