'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, HelpCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card';

function CancelContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'solo';
  const planName = plan.toLowerCase() === 'agency' ? 'Scale / Agence' : 'Starter / Solo';

  return (
    <div className="relative z-10 w-full max-w-md px-4">
      {/* Decorative background glow */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />

      <Card className="border-zinc-800 bg-zinc-950/70 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 via-amber-500 to-amber-600" />
        
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle className="h-9 w-9" />
          </div>
          
          <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Paiement Annulé
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm mt-1">
            La transaction a été interrompue et aucun débit n'a été effectué.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4 text-center">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Vous avez annulé la procédure de paiement pour l'offre <span className="text-white font-medium">{planName}</span>. 
            Vous pouvez modifier vos options ou réessayer à tout moment.
          </p>

          <div className="text-xs text-zinc-500 flex items-center justify-center gap-1.5 bg-zinc-900/30 rounded py-2 border border-zinc-900">
            <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
            <span>Besoin d'aide ou d'un devis personnalisé ? Contactez-nous.</span>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 pb-8 pt-2">
          <Link href="/app/settings" className="w-full">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-medium shadow-lg shadow-rose-500/10 border-0 group py-6 rounded-xl cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Retourner aux Plans</span>
            </Button>
          </Link>
          
          <Link href="/app" className="w-full">
            <Button variant="ghost" className="w-full text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/60 rounded-xl py-6 cursor-pointer">
              Retourner au Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function BillingCancelPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute inset-0 bg-radial-gradient-dark" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <RefreshCcw className="h-8 w-8 animate-spin text-amber-400" />
          <span className="text-zinc-400 text-sm">Chargement...</span>
        </div>
      }>
        <CancelContent />
      </Suspense>
    </main>
  );
}
