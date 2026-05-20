import React from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Sparkles, ArrowRight, Compass, ShieldCheck, Mail, Check } from 'lucide-react';

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans flex flex-col justify-between">
      
      {/* Navigation Header */}
      <header className="mx-auto max-w-7xl w-full px-6 h-16 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Vectra</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/sign-in" className="text-sm font-semibold hover:text-primary transition-colors">
            Se connecter
          </Link>
          <Link href="/auth/sign-up">
            <Button size="sm" className="bg-primary hover:bg-primary/95 text-white font-semibold">
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-20 text-center">
        
        {/* Alpha Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-6 animate-pulse">
          <Sparkles className="h-3 w-3" />
          Vectra Alpha est disponible
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-4xl leading-tight">
          Convertissez vos leads froids en{' '}
          <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            rendez-vous chauds
          </span>{' '}
          grâce à l'IA.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Importez vos listes de prospects, et laissez l'IA de Vectra analyser leur site internet et rédiger des messages d'outreach hyper-personnalisés (Cold Email & LinkedIn DM).
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-primary hover:bg-primary/95 text-white font-bold px-8 h-12 shadow-lg shadow-primary/10">
              Créer mon compte
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/auth/sign-in">
            <Button size="lg" variant="outline" className="px-8 h-12">
              Démo interactive
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid gap-8 md:grid-cols-3 text-left">
          
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Recherche Intelligente</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Scrape automatiquement le site web et analyse l'activité de vos leads pour en extraire les points clés.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Rédaction Multi-Canaux</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Génère des cold emails structurés et des messages d'invitation LinkedIn adaptés à votre offre et votre angle d'approche.
            </p>
          </div>

          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Validation & Export CSV</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Passez en revue les messages, éditez les brouillons, validez et exportez en un clic vers vos outils d'envoi.
            </p>
          </div>

        </div>

        {/* Benefits banner */}
        <div className="mt-20 w-full max-w-4xl border border-zinc-200 rounded-2xl p-8 bg-zinc-100/50 dark:bg-zinc-900/40 dark:border-zinc-800 flex flex-wrap items-center justify-around gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check className="h-4 w-4" /></div>
            <span className="font-semibold text-sm">Génération en 30 secondes</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check className="h-4 w-4" /></div>
            <span className="font-semibold text-sm">Support Français & Anglais</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check className="h-4 w-4" /></div>
            <span className="font-semibold text-sm">Alpha Gratuite (Max 50 leads)</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-900 py-8 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-4 text-xs text-zinc-400">
          <span>&copy; {new Date().getFullYear()} Vectra Inc. Tous droits réservés.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Conditions d'utilisation</Link>
            <Link href="#" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
