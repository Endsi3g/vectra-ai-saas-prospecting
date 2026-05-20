import React from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Sparkles, ArrowRight, Compass, ShieldCheck, Mail, Check, Zap, Users, BarChart3 } from 'lucide-react';

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col">

      {/* Sticky Navigation Header — frosted glass */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">Vectra</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500">
            <Link href="#features" className="hover:text-zinc-900 transition-colors">Fonctionnalités</Link>
            <Link href="#pricing" className="hover:text-zinc-900 transition-colors">Tarifs</Link>
            <Link href="#how" className="hover:text-zinc-900 transition-colors">Comment ça marche</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/sign-in" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors hidden sm:block">
              Se connecter
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="bg-primary text-white font-semibold shadow-sm shadow-primary/20">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-32 max-w-5xl mx-auto">

          {/* Alpha Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-8 animate-fade-up">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            Vectra Alpha — accès gratuit jusqu'à 50 leads
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-[-0.03em] text-zinc-900 max-w-4xl leading-[1.05] animate-fade-up stagger-1">
            Convertissez vos leads froids en{' '}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              rendez-vous chauds
            </span>{' '}
            grâce à l'IA.
          </h1>

          {/* Subtitle */}
          <p className="mt-7 text-lg sm:text-xl text-zinc-500 max-w-2xl leading-relaxed animate-fade-up stagger-2">
            Importez vos prospects, laissez l'IA analyser leurs sites et rédiger des messages d'outreach hyper-personnalisés en Cold Email & LinkedIn DM.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-up stagger-3">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-primary text-white font-bold px-8 h-12 shadow-lg shadow-primary/15 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 transition-all duration-200">
                Créer mon compte
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button size="lg" variant="outline" className="px-8 h-12 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
                Démo interactive
              </Button>
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400 font-medium animate-fade-up stagger-4">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Génération en 30 secondes
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-200 hidden sm:block" />
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Français & Anglais
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-200 hidden sm:block" />
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Aucune carte bancaire requise
            </span>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mb-4">
              Tout ce qu'il vous faut pour prospecter efficacement
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Vectra automatise chaque étape de votre cycle de prospection B2B.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Compass,
                title: 'Recherche Intelligente',
                description: 'Scraping automatique et analyse IA des sites web de vos leads pour extraire les informations clés.',
                delay: 'stagger-1',
              },
              {
                icon: Mail,
                title: 'Rédaction Multi-Canaux',
                description: 'Cold emails structurés et messages LinkedIn DM adaptés à votre offre et votre angle d\'approche.',
                delay: 'stagger-2',
              },
              {
                icon: ShieldCheck,
                title: 'Validation & Export CSV',
                description: 'Passez en revue les messages, éditez les brouillons, validez et exportez en un clic.',
                delay: 'stagger-3',
              },
              {
                icon: Zap,
                title: 'Agents Autonomes',
                description: 'Hermes, Apollo et Athena travaillent en arrière-plan pour automatiser votre pipeline.',
                delay: 'stagger-1',
              },
              {
                icon: Users,
                title: 'Gestion des Leads',
                description: 'Bibliothèque de candidats organisée en collections, avec filtres et import CSV.',
                delay: 'stagger-2',
              },
              {
                icon: BarChart3,
                title: 'Analytics Avancées',
                description: 'Suivez vos KPIs — taux d\'ouverture, réponses, appels bookés — avec des graphiques temps réel.',
                delay: 'stagger-3',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`group bg-white border border-zinc-200 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-lg hover:border-zinc-300 transition-all duration-[220ms] animate-fade-up ${feature.delay}`}
                >
                  <div className="h-10 w-10 bg-primary/8 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-24 px-6 bg-zinc-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mb-4">
              En 3 étapes simples
            </h2>
            <p className="text-zinc-500 text-lg mb-16 max-w-xl mx-auto">
              De l'import de prospects à l'envoi de messages personnalisés en quelques minutes.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              {[
                { num: '01', title: 'Importez vos prospects', desc: 'Importez via CSV ou recherche NLP directement dans l\'app.' },
                { num: '02', title: 'L\'IA analyse et rédige', desc: 'Vectra scrape les sites, analyse le contexte et génère des messages personnalisés.' },
                { num: '03', title: 'Validez et envoyez', desc: 'Revoyez les brouillons, approuvez et exportez vers vos outils d\'envoi.' },
              ].map((step, idx) => (
                <div key={idx} className={`space-y-3 animate-fade-up stagger-${idx + 1}`}>
                  <span className="text-4xl font-extrabold text-primary/20 font-mono">{step.num}</span>
                  <h3 className="font-bold text-base text-zinc-900">{step.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-primary/5 border border-primary/15 rounded-3xl p-12 animate-fade-up">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mb-4">
                Prêt à transformer votre prospection ?
              </h2>
              <p className="text-zinc-500 mb-8 leading-relaxed">
                Commencez gratuitement avec 50 leads. Aucune carte bancaire requise.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-primary text-white font-bold px-8 h-12 shadow-lg shadow-primary/15 hover:-translate-y-0.5 transition-all duration-200">
                    Créer mon compte gratuit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/app?bypass=true">
                  <Button size="lg" variant="outline" className="px-8 h-12 hover:-translate-y-0.5 transition-all duration-200">
                    Voir la démo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-start gap-8 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-zinc-900">Vectra</span>
            </div>
            <p className="text-zinc-400 text-xs max-w-xs leading-relaxed">
              Plateforme AI de prospection B2B — automatisez vos outreach et boostez vos conversions.
            </p>
          </div>
          <div className="flex gap-12 text-xs text-zinc-400">
            <div className="space-y-2">
              <p className="font-semibold text-zinc-600 mb-3">Produit</p>
              <Link href="#features" className="block hover:text-primary transition-colors">Fonctionnalités</Link>
              <Link href="#pricing" className="block hover:text-primary transition-colors">Tarifs</Link>
              <Link href="/app?bypass=true" className="block hover:text-primary transition-colors">Démo</Link>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-zinc-600 mb-3">Légal</p>
              <Link href="#" className="block hover:text-primary transition-colors">Conditions</Link>
              <Link href="#" className="block hover:text-primary transition-colors">Confidentialité</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-zinc-100">
          <p className="text-xs text-zinc-400">&copy; {new Date().getFullYear()} Vectra Inc. Tous droits réservés.</p>
        </div>
      </footer>

    </div>
  );
}
