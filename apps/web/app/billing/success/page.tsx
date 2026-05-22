'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Sparkles, Receipt, RefreshCcw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';

function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'solo';
  
  const planName = plan.toLowerCase() === 'agency' ? 'Scale / Agence' : 'Starter / Solo';
  const planCredits = plan.toLowerCase() === 'agency' ? '20 000' : '5 000';
  const planPrice = plan.toLowerCase() === 'agency' ? '79€ / mois' : '29€ / mois';

  return (
    <div className="relative z-10 w-full max-w-md px-4">
      {/* Decorative background glow */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />

      <Card className="border-zinc-800 bg-zinc-950/70 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-500" />
        
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 relative">
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
            <CheckCircle2 className="h-9 w-9 relative z-10" />
          </div>
          
          <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Paiement Réussi !</span>
            <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400 animate-pulse" />
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm mt-1">
            Merci pour votre confiance. Votre compte a été mis à jour.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4">
          <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-4 space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2">
              <span className="text-zinc-400">Plan activé</span>
              <span className="font-semibold text-white">{planName}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2">
              <span className="text-zinc-400">Crédits mensuels</span>
              <span className="font-semibold text-emerald-400">{planCredits} crédits</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Tarif</span>
              <span className="font-semibold text-white">{planPrice}</span>
            </div>
          </div>

          <div className="text-xs text-zinc-500 text-center flex items-center justify-center gap-1.5 bg-zinc-900/30 rounded py-2 border border-zinc-900">
            <Receipt className="h-3.5 w-3.5 text-zinc-400" />
            <span>Votre facture PDF sera téléchargeable dans vos paramètres.</span>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 pb-8 pt-2">
          <Link href="/app" className="w-full">
            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/10 border-0 group py-6 rounded-xl cursor-pointer">
              <span>Accéder au Dashboard</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          
          <Link href="/app/settings" className="w-full">
            <Button variant="ghost" className="w-full text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/60 rounded-xl py-6 cursor-pointer">
              Gérer mon abonnement
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 bg-radial-gradient-dark" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <RefreshCcw className="h-8 w-8 animate-spin text-emerald-400" />
          <span className="text-zinc-400 text-sm">Chargement de votre session...</span>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
