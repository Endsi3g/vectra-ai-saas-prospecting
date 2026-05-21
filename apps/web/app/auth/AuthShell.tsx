'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface AuthShellProps {
  title: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export default function AuthShell({
  title,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">

      {/* Brand header */}
      <header className="absolute top-0 left-0 p-6 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-base text-zinc-900">Vectra</span>
        </Link>
      </header>

      <main className="flex flex-1 min-h-screen">
        {/* Left side — Form */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-24 animate-fade-up">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">{title}</h1>
              <p className="text-sm text-zinc-400">
                {footerText}{' '}
                <Link href={footerLinkHref} className="font-semibold text-primary hover:underline">
                  {footerLinkText}
                </Link>
              </p>
            </div>
            {children}
          </div>
        </div>

        {/* Right side — Hero image (hidden on mobile) */}
        <div className="hidden md:flex w-[45%] max-w-[520px] bg-zinc-50 items-center justify-center p-12 animate-scale-in">
          <div className="relative w-full max-w-[380px] aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_25px_60px_-10px_oklch(0_0_0/0.12)]">
            <Image
              src="/auth-hero.png"
              alt="Vectra interface"
              fill
              sizes="380px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <h2 className="text-white font-bold text-lg leading-snug">
                Automatisez votre prospection SaaS
              </h2>
              <p className="text-white/70 text-xs leading-relaxed">
                Les équipes commerciales les plus performantes utilisent Vectra pour automatiser leur prospection B2B.
              </p>
            </div>
            <div className="absolute bottom-6 right-6 flex gap-1.5">
              <span className="h-1.5 w-4 rounded-full bg-white" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-4 px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
        <span>&copy; {new Date().getFullYear()} Vectra Inc.</span>
        <div className="flex gap-4">
          <Link href="/legal/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
          <Link href="/legal/terms" className="hover:text-primary transition-colors">Conditions</Link>
          <Link href="/#features" className="hover:text-primary transition-colors">En savoir plus</Link>
        </div>
      </footer>
    </div>
  );
}
