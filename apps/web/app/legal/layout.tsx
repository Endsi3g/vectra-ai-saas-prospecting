import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="border-b border-zinc-100 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-emerald-600 transition-colors">
            <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="8" height="8" rx="2" />
              <rect x="13" y="3" width="8" height="8" rx="2" fillOpacity="0.5" />
              <rect x="3" y="13" width="8" height="8" rx="2" fillOpacity="0.5" />
            </svg>
            Vectra
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>
      <footer className="border-t border-zinc-100 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-center gap-4 text-xs text-zinc-400">
          <span>&copy; {new Date().getFullYear()} Vectra OS Inc. Tous droits réservés.</span>
          <div className="flex gap-4">
            <Link href="/legal/terms" className="hover:text-zinc-900 transition-colors">Conditions</Link>
            <Link href="/legal/privacy" className="hover:text-zinc-900 transition-colors">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
