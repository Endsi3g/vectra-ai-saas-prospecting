'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Eye, EyeOff, Copy, CheckCircle2, AlertCircle, Loader2,
  BarChart2, List, Webhook, Key, ExternalLink, RefreshCw, Globe,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scope: string;
  key_type: 'live' | 'test';
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  rawKey?: string;
}

interface RequestLog {
  id: string;
  method: string;
  path: string;
  status_code: number;
  latency_ms: number | null;
  is_sandbox: boolean;
  created_at: string;
}

interface UsageStat { date: string; requests: number }

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  description: string | null;
  created_at: string;
}

const WEBHOOK_EVENTS = [
  'lead.created', 'lead.updated', 'lead.deleted',
  'message.generated', 'message.approved', 'message.sent',
  'sequence.step_sent', 'sequence.completed', 'sequence.stopped',
  'inbox.reply_received', 'inbox.sentiment_changed',
];

const TABS = ['Clés API', 'Usage', 'Logs', 'Webhooks'] as const;
type Tab = (typeof TABS)[number];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DeveloperPortalPage() {
  const [tab, setTab] = useState<Tab>('Clés API');

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Developer Portal</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Clés API, webhooks, logs de requêtes.</p>
        </div>
        <Link
          href="/api-docs"
          target="_blank"
          className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <Globe className="h-4 w-4" />
          API Reference
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Sandbox banner */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
        <div className="text-sm">
          <span className="font-medium text-violet-300">Mode sandbox disponible.</span>
          <span className="text-zinc-400"> Créez une clé <code className="text-violet-300">vt_test_xxx</code> pour tester l&apos;API sans consommer de crédits.</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Clés API' && <ApiKeysTab />}
      {tab === 'Usage' && <UsageTab />}
      {tab === 'Logs' && <LogsTab />}
      {tab === 'Webhooks' && <WebhooksTab />}
    </div>
  );
}

// ── API Keys Tab ──────────────────────────────────────────────────────────────

function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [scope, setScope] = useState<'read' | 'write' | 'read_write'>('read_write');
  const [keyType, setKeyType] = useState<'live' | 'test'>('live');
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/keys');
    const data = await res.json();
    setKeys(data.keys ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createKey() {
    if (!name.trim()) { setError('Le nom est requis.'); return; }
    setCreating(true);
    setError(null);
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), scope, key_type: keyType }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Erreur'); setCreating(false); return; }
    setKeys((prev) => [{ ...data, rawKey: data.key }, ...prev]);
    setName('');
    setCreating(false);
  }

  async function revokeKey(id: string) {
    if (!confirm('Révoquer cette clé ? Elle ne fonctionnera plus immédiatement.')) return;
    await fetch(`/api/keys/${id}`, { method: 'DELETE' });
    load();
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Create key form */}
      <div className="border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-300 flex items-center gap-2"><Key className="h-4 w-4" />Créer une nouvelle clé</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de la clé (ex: Zapier Integration)"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 md:col-span-1"
          />
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as typeof scope)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="read_write">Read + Write</option>
            <option value="read">Read only</option>
            <option value="write">Write only</option>
          </select>
          <select
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as typeof keyType)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="live">Live (vt_live_xxx)</option>
            <option value="test">Sandbox (vt_test_xxx)</option>
          </select>
        </div>
        <button
          onClick={createKey}
          disabled={creating}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors w-fit disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Créer la clé
        </button>
      </div>

      {/* Keys list */}
      {loading ? (
        <div className="text-center py-8 text-zinc-500 text-sm">Chargement…</div>
      ) : keys.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">Aucune clé API. Créez-en une ci-dessus.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {keys.map((k) => (
            <div key={k.id} className="border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{k.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${k.key_type === 'test' ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {k.key_type === 'test' ? 'sandbox' : 'live'}
                  </span>
                  <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{k.scope}</span>
                </div>
                {k.rawKey ? (
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-zinc-800 text-emerald-400 px-2 py-1 rounded">{k.rawKey}</code>
                    <button onClick={() => copyToClipboard(k.rawKey!, k.id)} className="text-zinc-400 hover:text-white">
                      {copied === k.id ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <span className="text-xs text-amber-400">⚠ Copiez cette clé maintenant — elle ne sera plus affichée.</span>
                  </div>
                ) : (
                  <code className="text-xs font-mono text-zinc-500">{k.key_prefix}••••••••••••••••••••••</code>
                )}
                {k.last_used_at && (
                  <p className="text-xs text-zinc-600 mt-0.5">Dernière utilisation : {new Date(k.last_used_at).toLocaleString('fr-FR')}</p>
                )}
              </div>
              <button onClick={() => revokeKey(k.id)} className="text-zinc-600 hover:text-red-400 transition-colors" title="Révoquer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Usage Tab ─────────────────────────────────────────────────────────────────

function UsageTab() {
  const [stats, setStats] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/developer/usage');
      if (res.ok) setStats(await res.json());
      setLoading(false);
    })();
  }, []);

  const maxRequests = Math.max(...stats.map((s) => s.requests), 1);
  const total = stats.reduce((a, s) => a + s.requests, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-400 mb-1">Requêtes (30j)</p>
          <p className="text-2xl font-semibold">{total.toLocaleString('fr-FR')}</p>
        </div>
        <div className="border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-400 mb-1">Aujourd&apos;hui</p>
          <p className="text-2xl font-semibold">{(stats[stats.length - 1]?.requests ?? 0).toLocaleString('fr-FR')}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-zinc-500 text-sm">Chargement…</div>
      ) : stats.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">Aucune requête API encore. Commencez à utiliser l&apos;API !</p>
      ) : (
        <div className="border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2"><BarChart2 className="h-4 w-4" />Requêtes / jour</h2>
          <div className="flex items-end gap-1 h-32">
            {stats.map((s) => (
              <div key={s.date} className="flex flex-col items-center gap-1 flex-1" title={`${s.date}: ${s.requests}`}>
                <div
                  className="w-full bg-blue-500 rounded-sm transition-all"
                  style={{ height: `${Math.round((s.requests / maxRequests) * 112)}px`, minHeight: s.requests > 0 ? 2 : 0 }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>{stats[0]?.date}</span>
            <span>{stats[stats.length - 1]?.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Logs Tab ──────────────────────────────────────────────────────────────────

function LogsTab() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/developer/logs');
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusColor = (code: number) => {
    if (code < 300) return 'text-emerald-400';
    if (code < 400) return 'text-blue-400';
    if (code < 500) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300 flex items-center gap-2"><List className="h-4 w-4" />100 dernières requêtes</h2>
        <button onClick={load} className="text-zinc-400 hover:text-white transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-zinc-500 text-sm">Chargement…</div>
      ) : logs.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">Aucune requête API pour l&apos;instant.</p>
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_60px_80px_160px] text-xs text-zinc-500 px-4 py-2 border-b border-zinc-800 font-medium uppercase tracking-wide">
            <span>Méthode</span><span>Endpoint</span><span>Status</span><span>Latence</span><span>Date</span>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800/50">
            {logs.map((log) => (
              <div key={log.id} className="grid grid-cols-[80px_1fr_60px_80px_160px] px-4 py-2.5 text-xs items-center hover:bg-zinc-800/30">
                <span className="font-mono text-zinc-300">{log.method}</span>
                <span className="font-mono text-zinc-400 truncate">{log.path}</span>
                <span className={`font-mono font-medium ${statusColor(log.status_code)}`}>{log.status_code}</span>
                <span className="text-zinc-500">{log.latency_ms ? `${log.latency_ms}ms` : '–'}</span>
                <span className="text-zinc-600">{new Date(log.created_at).toLocaleString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Webhooks Tab ──────────────────────────────────────────────────────────────

function WebhooksTab() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/v1/webhooks', { headers: { Authorization: `Bearer ` } });
    // For the portal we use a different endpoint
    const res2 = await fetch('/api/developer/webhooks');
    if (res2.ok) {
      const data = await res2.json();
      setEndpoints(data.endpoints ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleEvent(ev: string) {
    setSelectedEvents((prev) => prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]);
  }

  async function createWebhook() {
    if (!url.startsWith('https://')) { setError('URL doit commencer par https://'); return; }
    if (!selectedEvents.length) { setError('Sélectionnez au moins un événement.'); return; }
    setCreating(true);
    setError(null);
    const res = await fetch('/api/developer/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, events: selectedEvents, description }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Erreur'); setCreating(false); return; }
    setUrl(''); setSelectedEvents([]); setDescription('');
    setCreating(false);
    load();
  }

  async function deleteWebhook(id: string) {
    if (!confirm('Supprimer ce webhook ?')) return;
    await fetch(`/api/developer/webhooks?id=${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Create form */}
      <div className="border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-300 flex items-center gap-2"><Webhook className="h-4 w-4" />Ajouter un webhook</h2>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-app.com/webhook"
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
        />
        <div>
          <p className="text-xs text-zinc-400 mb-2">Événements</p>
          <div className="flex flex-wrap gap-2">
            {WEBHOOK_EVENTS.map((ev) => (
              <button
                key={ev}
                onClick={() => toggleEvent(ev)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${selectedEvents.includes(ev) ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={createWebhook}
          disabled={creating}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors w-fit disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Ajouter
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-6 text-zinc-500 text-sm">Chargement…</div>
      ) : endpoints.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-6">Aucun webhook configuré.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {endpoints.map((ep) => (
            <div key={ep.id} className="border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-sm text-zinc-200 truncate">{ep.url}</code>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ep.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {ep.is_active ? 'actif' : 'inactif'}
                  </span>
                </div>
                {ep.description && <p className="text-xs text-zinc-500 mb-1">{ep.description}</p>}
                <div className="flex flex-wrap gap-1">
                  {ep.events.map((ev) => (
                    <span key={ev} className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{ev}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => deleteWebhook(ep.id)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
