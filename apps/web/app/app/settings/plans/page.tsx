'use client';

import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Check, Loader2, Calendar, ShieldCheck, HeartHandshake, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PlansPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [billingLoading, setBillingLoading] = useState<string | null>(null);

  const handleUpgrade = async (selectedPlan: string) => {
    setBillingLoading(selectedPlan);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/sign-in';
        return;
      }

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan: selectedPlan })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Upgrade redirect error:', err);
    } finally {
      setBillingLoading(null);
    }
  };

  // Pricing calculations
  const prices = {
    starter: billingPeriod === 'monthly' ? 199 : 159,
    scale: billingPeriod === 'monthly' ? 499 : 399
  };

  return (
    <div className="p-10 bg-white">
      <div className="max-w-5xl space-y-10">
        {/* Title Block */}
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Plans</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Choose a plan that fits your needs
          </p>
        </div>

        {/* Billing Period Selector */}
        <div className="flex items-center justify-between max-w-4xl border-b border-zinc-100 pb-4">
          <span className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Available Plans</span>
          
          <div className="flex items-center gap-3 select-none">
            <span className="text-xs font-bold text-zinc-500">Billing period:</span>
            <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <span>Annual</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-600 font-extrabold px-1 rounded">-20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {/* Card 1: Free */}
          <div className="border border-zinc-250 rounded-2xl p-6 bg-white flex flex-col justify-between h-[450px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-zinc-100 text-zinc-500 shrink-0">
                  <Calendar className="h-4 w-4" />
                </span>
                <h3 className="font-extrabold text-base text-zinc-900">Free</h3>
              </div>
              <p className="text-xs text-zinc-400 font-medium">For trying out the platform</p>
              
              <div className="pt-2">
                <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">Free</span>
              </div>

              <ul className="space-y-2.5 pt-4">
                {['5 searches', 'Candidate collections', 'Network upload', '500 trial credits'].map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                    <Check className="h-4 w-4 text-[#5FC890] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              disabled
              className="w-full h-10 border border-zinc-200 bg-zinc-50 text-zinc-400 text-xs font-bold rounded-lg cursor-not-allowed select-none"
            >
              Free Plan Active
            </Button>
          </div>

          {/* Card 2: Starter */}
          <div className="border border-zinc-250 rounded-2xl p-6 bg-white flex flex-col justify-between h-[450px] shadow-sm relative">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-primary/10 text-primary shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <h3 className="font-extrabold text-base text-zinc-900">Starter</h3>
              </div>
              <p className="text-xs text-zinc-400 font-medium">For basic sourcing needs</p>
              
              <div className="pt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">${prices.starter}</span>
                <span className="text-[11px] text-zinc-400 font-medium">/ month / seat</span>
              </div>

              <ul className="space-y-2.5 pt-4">
                {['Unlimited sourcing', 'ATS connection', 'Email sequences', 'Unlimited exports', '5.000 monthly credits'].map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                    <Check className="h-4 w-4 text-[#5FC890] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handleUpgrade('solo')}
              disabled={!!billingLoading}
              className="w-full h-10 bg-[#5FC890] hover:bg-[#4eb67e] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {billingLoading === 'solo' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Upgrade to Starter'
              )}
            </Button>
          </div>

          {/* Card 3: Scale */}
          <div className="border border-zinc-250 rounded-2xl p-6 bg-white flex flex-col justify-between h-[450px] shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <HeartHandshake className="h-4 w-4" />
                </span>
                <h3 className="font-extrabold text-base text-zinc-900">Scale</h3>
              </div>
              <p className="text-xs text-zinc-400 font-medium">For more robust workflows</p>
              
              <div className="pt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">${prices.scale}</span>
                <span className="text-[11px] text-zinc-400 font-medium">/ month / seat</span>
              </div>

              <ul className="space-y-2.5 pt-4">
                {['Everything in Starter', 'Inbound sourcing', 'LinkedIn outreach', 'All agent models', 'Priority support', '20.000 monthly credits'].map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-xs font-semibold text-zinc-600">
                    <Check className="h-4 w-4 text-[#5FC890] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handleUpgrade('agency')}
              disabled={!!billingLoading}
              className="w-full h-10 bg-[#5FC890] hover:bg-[#4eb67e] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              {billingLoading === 'agency' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Upgrade to Scale'
              )}
            </Button>
          </div>
        </div>

        {/* Vectra Experts bottom banner */}
        <div className="border border-zinc-200 rounded-2xl p-6 bg-[#FAFAFA]/50 max-w-4xl space-y-4 select-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-zinc-900">Vectra Experts</span>
                <span className="text-[9px] bg-primary/10 text-primary font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">New</span>
              </div>
              <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                Partner with top recruiters on Vectra to help fill your roles
              </p>
            </div>
            
            <button className="h-10 px-5 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 font-bold text-xs rounded-xl shadow-sm transition-all shrink-0">
              Book a call
            </button>
          </div>

          {/* Badges footer list */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-zinc-150 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5FC890]" />
              Slack channel
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5FC890]" />
              Live intake and syncs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5FC890]" />
              Monthly basis
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5FC890]" />
              Add on to any plan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
