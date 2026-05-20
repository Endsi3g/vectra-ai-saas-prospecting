'use client';

import React, { useState } from 'react';
import { Gift, Check, Share2 } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('https://vectra.ai/ref/kael249');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-10 bg-white">
      <div className="max-w-3xl space-y-8 select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Referrals</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Invite friends to Vectra and earn free sourcing credits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Share link */}
          <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-[#5FC890]">
                <Gift className="h-4 w-4" />
              </span>
              <h3 className="font-extrabold text-sm text-zinc-900">Your referral link</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-normal">
              For every friend who joins Vectra and launches their first campaign, you both get 200 free credits.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Input
                readOnly
                value="https://vectra.ai/ref/kael249"
                className="h-9 text-xs border-zinc-200 bg-zinc-50 text-zinc-500 font-mono"
              />
              <button
                onClick={handleCopy}
                className="h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Stats */}
          <div className="border border-zinc-250 rounded-2xl p-6 bg-[#FAFAFA]/50 space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Earnings</span>
              <div className="text-3xl font-extrabold text-zinc-900">0</div>
            </div>
            <div className="text-xs text-zinc-500 leading-normal pt-4 border-t border-zinc-150">
              No referrals registered yet. Share your code above to begin earning!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
