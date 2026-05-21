'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 shadow-sm space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour à l'accueil
        </Link>

        <div className="space-y-2 border-b border-zinc-100 pb-6">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Conditions Générales d'Utilisation</h1>
          <p className="text-xs text-zinc-400 font-mono">Dernière mise à jour : 20 mai 2026</p>
        </div>

        <div className="prose prose-zinc max-w-none text-sm text-zinc-600 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-800">1. Acceptation des Conditions</h2>
            <p>
              En accédant et en utilisant Vectra OS (la "Plateforme"), vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-800">2. Services fournis</h2>
            <p>
              Vectra OS fournit une suite logicielle assistée par intelligence artificielle pour la prospection commerciale B2B, y compris la qualification de leads, la génération de messages personnalisés et l'intégration de campagnes d'emailing Brevo.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-800">3. Protection des Données et Abonnements</h2>
            <p>
              L'utilisation des crédits de sourcing et l'usage des API clés tierces respectent les limitations de nos forfaits. L'utilisateur est seul responsable du respect des réglementations de communication commerciale (e.g. RGPD, CAN-SPAM).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-800">4. Responsabilité</h2>
            <p>
              Vectra OS décline toute responsabilité en cas de dysfonctionnement lié aux APIs tierces (Supabase, Brevo, Nylas) ou d'éventuelles interruptions temporaires de service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
