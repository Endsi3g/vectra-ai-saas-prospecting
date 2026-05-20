'use client';

import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Check, ArrowRight, Loader2, Layers } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  logoText: string;
  logoStyle: string;
  connected: boolean;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'ashby',
      name: 'Ashby',
      logoText: 'Ashby',
      logoStyle: 'font-serif tracking-tight text-zinc-900',
      connected: false
    },
    {
      id: 'greenhouse',
      name: 'Greenhouse',
      logoText: 'greenhouse',
      logoStyle: 'font-sans font-medium text-emerald-700 lowercase',
      connected: false
    },
    {
      id: 'lever',
      name: 'Lever',
      logoText: 'LEVER',
      logoStyle: 'font-sans font-black italic tracking-wide text-zinc-800 uppercase',
      connected: false
    },
    {
      id: 'posthog',
      name: 'Workable',
      logoText: 'workable',
      logoStyle: 'font-mono font-bold text-orange-600',
      connected: false
    }
  ]);

  const [slackConnected, setSlackConnected] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const toggleConnection = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, connected: !item.connected };
        }
        return item;
      }));
      setConnectingId(null);
    }, 1000);
  };

  const handleSlackConnect = () => {
    setConnectingId('slack');
    setTimeout(() => {
      setSlackConnected(!slackConnected);
      setConnectingId(null);
    }, 1200);
  };

  return (
    <div className="p-10 bg-white">
      <div className="max-w-4xl space-y-10">
        {/* Title Block */}
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Integrations</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Connect your tools and services
          </p>
        </div>

        {/* Section Applicant Tracking Systems */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Applicant Tracking Systems</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {integrations.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleConnection(item.id)}
                className={`border border-zinc-200 rounded-xl p-6 bg-white flex flex-col justify-between h-36 cursor-pointer select-none transition-all hover:shadow-sm ${
                  item.connected ? 'border-[#5FC890] bg-[#F7FDF9]' : 'hover:border-zinc-300'
                }`}
              >
                {/* Logo area */}
                <div className="flex items-start justify-between">
                  <span className={`text-xl ${item.logoStyle}`}>
                    {item.logoText}
                  </span>
                  {item.connected && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase select-none">
                      <Check className="h-2.5 w-2.5" />
                      Connected
                    </span>
                  )}
                </div>

                {/* Info & action */}
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400 pt-4">
                  <span>ATS Connector</span>
                  <div className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800">
                    {connectingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>{item.connected ? 'Disconnect' : 'Connect'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Slack App */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Slack App</h2>
          
          <div className="border border-zinc-200 rounded-2xl p-6 bg-[#FAFAFA]/30 max-w-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-zinc-100 rounded-xl flex items-center justify-center shrink-0 border border-zinc-150">
                <svg className="h-5 w-5 text-zinc-700" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.823 5.043a2.528 2.528 0 0 1-2.52-2.522A2.528 2.528 0 0 1 8.823 0a2.528 2.528 0 0 1 2.52 2.521v2.522h-2.52zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.522H3.78a2.528 2.528 0 0 1-2.52-2.522V8.824a2.528 2.528 0 0 1 2.52-2.52h5.043zm10.135 3.78a2.528 2.528 0 0 1 2.522-2.52 2.528 2.528 0 0 1 2.52 2.52 2.528 2.528 0 0 1-2.52 2.52h-2.522v-2.52zm-1.262 0a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.78a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043zm-3.78 10.136a2.528 2.528 0 0 1 2.52 2.522 2.528 2.528 0 0 1-2.52 2.52 2.528 2.528 0 0 1-2.522-2.52v-2.522h2.522zm0-1.262a2.528 2.528 0 0 1-2.522-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52H20.22a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.52 2.52h-5.043z"/>
                </svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-zinc-900">Slack Integration</h4>
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                  Run Vectra agents from Slack.
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
                  <span>Slack Connected</span>
                </>
              ) : (
                'Add to Slack'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
