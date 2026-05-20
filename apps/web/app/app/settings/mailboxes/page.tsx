'use client';

import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export default function MailboxesPage() {
  return (
    <div className="p-10 bg-white">
      <div className="max-w-3xl space-y-8 select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Mailboxes</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Connect and configure mailboxes to send automated outreaches
          </p>
        </div>

        <div className="border border-zinc-200 rounded-2xl p-8 bg-[#FAFAFA]/40 flex flex-col items-center justify-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-zinc-150 flex items-center justify-center text-zinc-500">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">No mailboxes connected yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            Connect your Gmail or Outlook accounts to allow Vectra agents to send personalized outreach drafts directly to your prospects.
          </p>
          <button className="h-9 px-4 mt-2 bg-[#5FC890] hover:bg-[#4eb67e] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1">
            <span>Connect account</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
