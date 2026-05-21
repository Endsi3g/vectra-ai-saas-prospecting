'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Integration {
  id: string;
  name: string;
  logoText: string;
  logoStyle: string;
  connected: boolean;
}

const INITIAL_INTEGRATIONS: Omit<Integration, 'connected'>[] = [
  { id: 'ashby', name: 'Ashby', logoText: 'Ashby', logoStyle: 'font-serif tracking-tight text-zinc-900' },
  { id: 'greenhouse', name: 'Greenhouse', logoText: 'greenhouse', logoStyle: 'font-sans font-medium text-emerald-700 lowercase' },
  { id: 'lever', name: 'Lever', logoText: 'LEVER', logoStyle: 'font-sans font-black italic tracking-wide text-zinc-800 uppercase' },
  { id: 'workable', name: 'Workable', logoText: 'workable', logoStyle: 'font-mono font-bold text-orange-600' },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(
    INITIAL_INTEGRATIONS.map(i => ({ ...i, connected: false }))
  );
  const [slackConnected, setSlackConnected] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('agent_config')
        .eq('id', user.id)
        .single();

      const saved = profile?.agent_config?.integrations;
      if (saved) {
        setIntegrations(INITIAL_INTEGRATIONS.map(i => ({ ...i, connected: !!saved[i.id] })));
        setSlackConnected(!!saved.slack);
      }
    });
  }, []);

  const persistIntegrations = async (updatedIntegrations: Integration[], slack: boolean) => {
    if (!userId) return;
    const { data: profile } = await supabase.from('profiles').select('agent_config').eq('id', userId).single();
    const currentConfig = profile?.agent_config || {};
    const integrationMap: Record<string, boolean> = { slack };
    updatedIntegrations.forEach(i => { integrationMap[i.id] = i.connected; });

    await supabase
      .from('profiles')
      .update({ agent_config: { ...currentConfig, integrations: integrationMap } })
      .eq('id', userId);
  };

  const toggleConnection = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setIntegrations(prev => {
        const updated = prev.map(item => item.id === id ? { ...item, connected: !item.connected } : item);
        persistIntegrations(updated, slackConnected);
        return updated;
      });
      setConnectingId(null);
    }, 800);
  };

  const handleSlackConnect = () => {
    setConnectingId('slack');
    setTimeout(() => {
      const newSlack = !slackConnected;
      setSlackConnected(newSlack);
      persistIntegrations(integrations, newSlack);
      setConnectingId(null);
    }, 800);
  };

  return (
    <div className="p-10 bg-white">
      <div className="max-w-4xl space-y-10">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Intégrations</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Connectez vos outils et services
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Systèmes ATS</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {integrations.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleConnection(item.id)}
                className={`border border-zinc-200 rounded-xl p-6 bg-white flex flex-col justify-between h-36 cursor-pointer select-none transition-all hover:shadow-sm ${
                  item.connected ? 'border-[#5FC890] bg-[#F7FDF9]' : 'hover:border-zinc-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-xl ${item.logoStyle}`}>{item.logoText}</span>
                  {item.connected && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase select-none">
                      <Check className="h-2.5 w-2.5" />
                      Connecté
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-zinc-400 pt-4">
                  <span>Connecteur ATS</span>
                  <div className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800">
                    {connectingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>{item.connected ? 'Déconnecter' : 'Connecter'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">App Slack</h2>

          <div className="border border-zinc-200 rounded-2xl p-6 bg-zinc-50/30 max-w-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0 border border-zinc-150">
                <svg className="h-5 w-5 text-zinc-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.823 5.043a2.528 2.528 0 0 1-2.52-2.522A2.528 2.528 0 0 1 8.823 0a2.528 2.528 0 0 1 2.52 2.521v2.522h-2.52zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.78a2.528 2.528 0 0 1-2.52-2.522V8.824a2.528 2.528 0 0 1 2.52-2.52h5.043zm10.135 3.78a2.528 2.528 0 0 1 2.522-2.52 2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.52h-2.522v-2.52zm-1.262 0a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.78a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043zm-3.78 10.136a2.528 2.528 0 0 1 2.52 2.522 2.528 2.528 0 0 1-2.52 2.52 2.528 2.528 0 0 1-2.522-2.52v-2.522h2.522zm0-1.262a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52H20.22a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.52h-5.043z"/>
                </svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-zinc-900">Intégration Slack</h4>
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                  Lancez les agents Vectra depuis Slack.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSlackConnect}
              disabled={connectingId === 'slack'}
              variant="outline"
              className={`h-10 px-5 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-bold text-xs rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1.5 ${
                slackConnected ? 'border-emerald-200 bg-emerald-50/20 text-emerald-800' : ''
              }`}
            >
              {connectingId === 'slack' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : slackConnected ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Slack connecté</span>
                </>
              ) : (
                'Ajouter à Slack'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
