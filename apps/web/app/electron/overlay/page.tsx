'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Phone, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Lead } from '@workspace/core/types';

function OverlayContent() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  const [lead, setLead] = useState<Lead | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leadId) { setLoading(false); return; }

    supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()
      .then(({ data }) => {
        setLead(data as Lead | null);
        setLoading(false);
      });
  }, [leadId]);

  if (loading) {
    return (
      <div className="w-full h-full bg-zinc-900/90 rounded-xl flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-zinc-600 animate-pulse" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="w-full h-full bg-zinc-900/90 rounded-xl flex items-center justify-center">
        <p className="text-xs text-zinc-500">Lead introuvable</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-zinc-900/90 backdrop-blur rounded-xl border border-zinc-700/40 shadow-2xl overflow-hidden flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-700/40">
        <Phone className="h-3 w-3 text-green-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{lead.name ?? 'Prospect'}</p>
          <p className="text-[10px] text-zinc-400 truncate">{lead.company ?? ''}</p>
        </div>
        <button onClick={() => setExpanded((v) => !v)} className="text-zinc-500 hover:text-zinc-300">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </button>
        <button
          onClick={() => window.electron?.closeOverlay?.()}
          className="text-zinc-600 hover:text-zinc-400"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {lead.role && (
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Poste</p>
              <p className="text-xs text-zinc-200">{lead.role}</p>
            </div>
          )}
          {lead.notes && (
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Notes</p>
              <p className="text-xs text-zinc-300 leading-relaxed">{lead.notes}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Pitch</p>
            <ul className="text-xs text-zinc-300 space-y-0.5 list-disc list-inside">
              <li>Personnaliser avec le contexte de l&apos;entreprise</li>
              <li>Valeur : gain de temps + qualification auto</li>
              <li>CTA : démo 20 min cette semaine ?</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full bg-zinc-900/90 rounded-xl flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-zinc-600 animate-pulse" />
      </div>
    }>
      <OverlayContent />
    </Suspense>
  );
}


