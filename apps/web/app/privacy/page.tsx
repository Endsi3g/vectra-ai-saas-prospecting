'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white border border-zinc-200 rounded-2xl p-8 md:p-12 shadow-sm space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour à l'accueil
        </Link>

        <div className="space-y-2 border-b border-zinc-100 pb-6">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Politique de Confidentialité</h1>
          <p className="text-xs text-zinc-400 font-mono">Dernière mise à jour : 20 mai 2026</p>
        </div>

        <div className="prose prose-zinc max-w-none text-sm text-zinc-600 leading-relaxed space-y-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-800">1. Collecte des Données</h2>
            <p>
              Nous collectons les adresses emails de vos prospects, les adresses des sites web associés et toute autre métadonnée requise pour formuler les messages personnalisés générés par l'IA.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-800">2. Sécurité des clés API</h2>
            <p>
              Toutes les clés d'intégration tierces (telles que votre clé API Brevo) sont chiffrées de bout en bout et stockées de manière sécurisée. Elles ne sont jamais partagées à des tiers non autorisés.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-800">3. Droits des Utilisateurs</h2>
            <p>
              Conformément à la réglementation RGPD, vous disposez d'un droit d'accès, de modification et de suppression de toutes vos données personnelles et des données de vos prospects sur simple demande.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
