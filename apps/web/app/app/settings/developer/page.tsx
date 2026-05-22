'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Copy, CheckCircle2, AlertCircle, Loader2,
  BarChart2, List, Webhook, Key, ExternalLink, RefreshCw, Globe,
  Terminal, ShieldCheck, Activity,
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

const TABS = [
  { id: 'keys', label: 'Clés API', icon: Key },
  { id: 'usage', label: 'Usage', icon: BarChart2 },
  { id: 'logs', label: 'Logs', icon: List },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
] as const;
type TabId = (typeof TABS)[number]['id'];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DeveloperPortalPage() {
  const [tab, setTab] = useState<TabId>('keys');

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-6 py-5 border-b border-zinc-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-zinc-400" />
              Developer Portal
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">Gérez vos clés API, webhooks et consultez les logs de requêtes.</p>
          </div>
          <Link
            href="/api-docs"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors border border-zinc-200 rounded-lg px-3 py-1.5 hover:bg-zinc-50"
          >
            <Globe className="h-3.5 w-3.5" />
            API Reference
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Sandbox banner */}
        <div className="mt-4 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-violet-700">Mode sandbox disponible.</span>
            <span className="text-violet-600"> Créez une clé <code className="bg-violet-100 text-violet-700 px-1 rounded font-mono text-[11px]">vt_test_xxx</code> pour tester l&apos;API sans consommer de crédits ni affecter vos données.</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-100 px-6 bg-white shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-1 py-3 mr-6 text-xs font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-4xl">
        {tab === 'keys' && <ApiKeysTab />}
        {tab === 'usage' && <UsageTab />}
        {tab === 'logs' && <LogsTab />}
        {tab === 'webhooks' && <WebhooksTab />}
      </div>
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
  const [revoking, setRevoking] = useState<string | null>(null);

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

  async function revokeKey(id: string, keyName: string) {
    if (!window.confirm(`Révoquer « ${keyName} » ? Cette clé cessera de fonctionner immédiatement.`)) return;
    setRevoking(id);
    await fetch(`/api/keys/${id}`, { method: 'DELETE' });
    setRevoking(null);
    load();
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const scopeLabel = (s: string) => ({ read: 'Lecture', write: 'Écriture', read_write: 'Lecture + Écriture' }[s] ?? s);

  return (
    <div className="flex flex-col gap-6">
      {/* Create key form */}
      <div className="border border-zinc-200 rounded-xl p-5 flex flex-col gap-4 bg-zinc-50">
        <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide flex items-center gap-2">
          <Key className="h-3.5 w-3.5" />Nouvelle clé API
        </h2>
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createKey()}
            placeholder="Nom (ex : Zapier Integration)"
            className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 md:col-span-1"
          />
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as typeof scope)}
            className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          >
            <option value="read_write">Lecture + Écriture</option>
            <option value="read">Lecture seule</option>
            <option value="write">Écriture seule</option>
          </select>
          <select
            value={keyType}
            onChange={(e) => setKeyType(e.target.value as typeof keyType)}
            className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          >
            <option value="live">Live (vt_live_xxx)</option>
            <option value="test">Sandbox (vt_test_xxx)</option>
          </select>
        </div>
        <button
          onClick={createKey}
          disabled={creating || !name.trim()}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors w-fit disabled:opacity-40"
        >
          {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Créer la clé
        </button>
      </div>

      {/* Keys list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="border border-zinc-100 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-zinc-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-zinc-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
          <Key className="h-8 w-8 text-zinc-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-400">Aucune clé API</p>
          <p className="text-xs text-zinc-400 mt-1">Créez votre première clé pour accéder à l&apos;API Vectra.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {keys.map((k) => (
            <div
              key={k.id}
              className={`border rounded-xl p-4 flex items-start gap-4 transition-colors ${
                k.is_active === false ? 'border-zinc-100 bg-zinc-50 opacity-60' : 'border-zinc-200 bg-white'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-zinc-900">{k.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    k.key_type === 'test'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {k.key_type === 'test' ? 'sandbox' : 'live'}
                  </span>
                  <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-medium">
                    {scopeLabel(k.scope)}
                  </span>
                  {k.is_active === false && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">révoquée</span>
                  )}
                </div>

                {k.rawKey ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-[11px] font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-lg">{k.rawKey}</code>
                    <button
                      onClick={() => copyToClipboard(k.rawKey!, k.id)}
                      className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      {copied === k.id
                        ? <><CheckCircle2 className="h-3 w-3 text-emerald-500" /><span className="text-emerald-600">Copié</span></>
                        : <><Copy className="h-3 w-3" /><span>Copier</span></>
                      }
                    </button>
                    <span className="text-[11px] text-amber-600 font-medium">⚠ Copiez maintenant — ne sera plus affichée</span>
                  </div>
                ) : (
                  <code className="text-[11px] font-mono text-zinc-400">{k.key_prefix}••••••••••••••••••••••</code>
                )}

                {k.last_used_at && (
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Dernière utilisation : {new Date(k.last_used_at).toLocaleString('fr-FR')}
                  </p>
                )}
                {!k.last_used_at && (
                  <p className="text-[10px] text-zinc-300 mt-1">Jamais utilisée</p>
                )}
              </div>

              {k.is_active !== false && (
                <button
                  onClick={() => revokeKey(k.id, k.name)}
                  disabled={revoking === k.id}
                  className="text-zinc-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                  title="Révoquer"
                >
                  {revoking === k.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />
                  }
                </button>
              )}
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
  const today = stats[stats.length - 1]?.requests ?? 0;
  const avg = stats.length ? Math.round(total / stats.length) : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-zinc-100 rounded-xl p-4 animate-pulse">
              <div className="h-2 bg-zinc-100 rounded w-1/2 mb-3" />
              <div className="h-6 bg-zinc-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="border border-zinc-200 rounded-xl p-4 bg-white">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-semibold mb-1">30 derniers jours</p>
          <p className="text-2xl font-bold text-zinc-900">{total.toLocaleString('fr-FR')}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">requêtes totales</p>
        </div>
        <div className="border border-zinc-200 rounded-xl p-4 bg-white">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-semibold mb-1">Aujourd&apos;hui</p>
          <p className="text-2xl font-bold text-zinc-900">{today.toLocaleString('fr-FR')}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">requêtes</p>
        </div>
        <div className="border border-zinc-200 rounded-xl p-4 bg-white">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-semibold mb-1">Moyenne / jour</p>
          <p className="text-2xl font-bold text-zinc-900">{avg.toLocaleString('fr-FR')}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">requêtes</p>
        </div>
      </div>

      {/* Chart */}
      <div className="border border-zinc-200 rounded-xl p-5 bg-white">
        <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-4 flex items-center gap-2">
          <BarChart2 className="h-3.5 w-3.5" />Requêtes par jour
        </h2>
        {total === 0 ? (
          <div className="text-center py-10 border border-dashed border-zinc-200 rounded-xl">
            <Activity className="h-8 w-8 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-400">Aucune requête API</p>
            <p className="text-xs text-zinc-400 mt-1">Commencez à utiliser l&apos;API pour voir vos stats ici.</p>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-0.5 h-28">
              {stats.map((s) => (
                <div
                  key={s.date}
                  className="flex flex-col items-center flex-1 group relative"
                  title={`${s.date} : ${s.requests} req`}
                >
                  <div
                    className="w-full rounded-t-sm transition-all bg-zinc-900 group-hover:bg-blue-600"
                    style={{
                      height: `${Math.round((s.requests / maxRequests) * 96)}px`,
                      minHeight: s.requests > 0 ? 3 : 0,
                    }}
                  />
                  {/* Tooltip */}
                  {s.requests > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {s.requests}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 mt-2 pt-2 border-t border-zinc-100">
              <span>{stats[0]?.date.slice(5)}</span>
              <span>{stats[Math.floor(stats.length / 2)]?.date.slice(5)}</span>
              <span>{stats[stats.length - 1]?.date.slice(5)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Logs Tab ──────────────────────────────────────────────────────────────────

function LogsTab() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '2xx' | '4xx' | '5xx'>('all');

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

  const filtered = logs.filter((l) => {
    if (filter === '2xx') return l.status_code >= 200 && l.status_code < 300;
    if (filter === '4xx') return l.status_code >= 400 && l.status_code < 500;
    if (filter === '5xx') return l.status_code >= 500;
    return true;
  });

  const statusColor = (code: number) => {
    if (code < 300) return 'text-emerald-600 bg-emerald-50';
    if (code < 400) return 'text-blue-600 bg-blue-50';
    if (code < 500) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const methodColor = (m: string) => ({
    GET: 'text-blue-700 bg-blue-50',
    POST: 'text-emerald-700 bg-emerald-50',
    PUT: 'text-amber-700 bg-amber-50',
    PATCH: 'text-violet-700 bg-violet-50',
    DELETE: 'text-red-700 bg-red-50',
  }[m] ?? 'text-zinc-700 bg-zinc-100');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1">
          {(['all', '2xx', '4xx', '5xx'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === f ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              {f === 'all' ? 'Tous' : f}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors border border-zinc-200 rounded-lg px-3 py-1.5 hover:bg-zinc-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />Actualiser
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-zinc-100 rounded-xl p-3 animate-pulse flex gap-3">
              <div className="h-4 bg-zinc-100 rounded w-12" />
              <div className="h-4 bg-zinc-100 rounded flex-1" />
              <div className="h-4 bg-zinc-100 rounded w-10" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
          <List className="h-8 w-8 text-zinc-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-400">
            {logs.length === 0 ? 'Aucune requête API pour l\'instant' : `Aucune requête ${filter}`}
          </p>
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
          <div className="grid grid-cols-[72px_1fr_56px_76px_140px] text-[10px] text-zinc-400 px-4 py-2.5 border-b border-zinc-100 font-semibold uppercase tracking-wide bg-zinc-50">
            <span>Méthode</span>
            <span>Endpoint</span>
            <span>Status</span>
            <span>Latence</span>
            <span>Date</span>
          </div>
          <div className="max-h-[460px] overflow-y-auto divide-y divide-zinc-50">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-[72px_1fr_56px_76px_140px] px-4 py-2.5 text-xs items-center hover:bg-zinc-50 transition-colors"
              >
                <span>
                  <span className={`font-mono font-semibold text-[10px] px-1.5 py-0.5 rounded ${methodColor(log.method)}`}>
                    {log.method}
                  </span>
                </span>
                <span className="font-mono text-zinc-600 truncate text-[11px]">{log.path}</span>
                <span>
                  <span className={`font-mono font-semibold text-[10px] px-1.5 py-0.5 rounded ${statusColor(log.status_code)}`}>
                    {log.status_code}
                  </span>
                </span>
                <span className="text-zinc-400 text-[11px]">{log.latency_ms ? `${log.latency_ms}ms` : '–'}</span>
                <span className="text-zinc-400 text-[11px]">{new Date(log.created_at).toLocaleString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-zinc-100 bg-zinc-50">
            <span className="text-[10px] text-zinc-400">{filtered.length} entrée{filtered.length > 1 ? 's' : ''} · 100 max affichées</span>
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
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/developer/webhooks');
    if (res.ok) {
      const data = await res.json();
      setEndpoints(data.endpoints ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleEvent(ev: string) {
    setSelectedEvents((prev) => prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]);
  }

  async function createWebhook() {
    if (!url.startsWith('https://')) { setError('L\'URL doit commencer par https://'); return; }
    if (!selectedEvents.length) { setError('Sélectionnez au moins un événement.'); return; }
    setCreating(true);
    setError(null);
    const res = await fetch('/api/developer/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, events: selectedEvents, description: description || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Erreur'); setCreating(false); return; }
    setUrl(''); setSelectedEvents([]); setDescription('');
    setCreating(false);
    load();
  }

  async function deleteWebhook(id: string, epUrl: string) {
    if (!window.confirm(`Supprimer le webhook vers ${epUrl} ?`)) return;
    setDeleting(id);
    await fetch(`/api/developer/webhooks?id=${id}`, { method: 'DELETE' });
    setDeleting(null);
    load();
  }

  const eventGroups = {
    Leads: WEBHOOK_EVENTS.filter((e) => e.startsWith('lead.')),
    Messages: WEBHOOK_EVENTS.filter((e) => e.startsWith('message.')),
    Séquences: WEBHOOK_EVENTS.filter((e) => e.startsWith('sequence.')),
    Inbox: WEBHOOK_EVENTS.filter((e) => e.startsWith('inbox.')),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create form */}
      <div className="border border-zinc-200 rounded-xl p-5 flex flex-col gap-4 bg-zinc-50">
        <h2 className="text-xs font-semibold text-zinc-700 uppercase tracking-wide flex items-center gap-2">
          <Webhook className="h-3.5 w-3.5" />Nouveau webhook
        </h2>
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
          </div>
        )}
        <div className="flex flex-col gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-app.com/webhook"
            className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optionnel)"
            className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
        </div>

        <div>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-2">Événements à écouter</p>
          <div className="flex flex-col gap-2">
            {Object.entries(eventGroups).map(([group, events]) => (
              <div key={group} className="flex items-start gap-3">
                <span className="text-[10px] font-semibold text-zinc-400 w-16 pt-1 shrink-0">{group}</span>
                <div className="flex flex-wrap gap-1.5">
                  {events.map((ev) => (
                    <button
                      key={ev}
                      onClick={() => toggleEvent(ev)}
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-mono transition-colors ${
                        selectedEvents.includes(ev)
                          ? 'bg-zinc-900 border-zinc-900 text-white'
                          : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 bg-white'
                      }`}
                    >
                      {ev}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {WEBHOOK_EVENTS.length > 0 && (
            <button
              onClick={() => setSelectedEvents(selectedEvents.length === WEBHOOK_EVENTS.length ? [] : [...WEBHOOK_EVENTS])}
              className="mt-2 text-[11px] text-zinc-500 hover:text-zinc-900 underline transition-colors"
            >
              {selectedEvents.length === WEBHOOK_EVENTS.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          )}
        </div>

        <button
          onClick={createWebhook}
          disabled={creating}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors w-fit disabled:opacity-40"
        >
          {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Ajouter le webhook
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="border border-zinc-100 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-zinc-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-zinc-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : endpoints.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
          <Webhook className="h-8 w-8 text-zinc-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-400">Aucun webhook configuré</p>
          <p className="text-xs text-zinc-400 mt-1">Ajoutez un endpoint pour recevoir des événements en temps réel.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {endpoints.map((ep) => (
            <div key={ep.id} className="border border-zinc-200 rounded-xl p-4 flex items-start justify-between gap-4 bg-white hover:border-zinc-300 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <code className="text-xs font-mono text-zinc-800 truncate max-w-[320px]">{ep.url}</code>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    ep.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {ep.is_active ? 'actif' : 'inactif'}
                  </span>
                </div>
                {ep.description && <p className="text-[11px] text-zinc-500 mb-1.5">{ep.description}</p>}
                <div className="flex flex-wrap gap-1">
                  {ep.events.map((ev) => (
                    <span key={ev} className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-mono">{ev}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => deleteWebhook(ep.id, ep.url)}
                disabled={deleting === ep.id}
                className="text-zinc-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                title="Supprimer"
              >
                {deleting === ep.id
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Trash2 className="h-4 w-4" />
                }
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Signature info */}
      <div className="border border-zinc-100 rounded-xl p-4 bg-zinc-50 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
        <div className="text-xs text-zinc-500">
          <span className="font-semibold text-zinc-700">Vérification des signatures.</span>
          {' '}Chaque requête webhook inclut un header <code className="font-mono text-zinc-600 bg-zinc-100 px-1 rounded text-[11px]">X-Vectra-Signature: sha256=…</code> pour valider l&apos;authenticité de l&apos;événement.
        </div>
      </div>
    </div>
  );
}
