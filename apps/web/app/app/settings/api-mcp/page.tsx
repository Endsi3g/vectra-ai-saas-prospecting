'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Key, Eye, EyeOff, Plus, Check, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { supabase } from '@/lib/supabase';

interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiMcpPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setGeneratedKey(null);

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newKeyName || 'Clé par défaut' })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedKey(data.key);
        setNewKeyName('');
        setShowCreateForm(false);
        fetchKeys();
      } else {
        alert('Erreur lors de la génération de la clé.');
      }
    } catch (err) {
      console.error('Error generating key:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cette clé API ? Cette action est irréversible et bloquera immédiatement tout service connecté utilisant cette clé.')) {
      return;
    }

    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setKeys(prev => prev.filter(k => k.id !== id));
        if (generatedKey) setGeneratedKey(null);
      } else {
        alert('Erreur lors de la révocation de la clé.');
      }
    } catch (err) {
      console.error('Error revoking key:', err);
    }
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="max-w-3xl space-y-8 select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Configuration API / MCP</h1>
          <p className="text-sm text-zinc-400 font-medium mt-1">
            Générez des clés API sécurisées pour connecter des agents externes et des services.
          </p>
        </div>

        {/* Generated Key One-Time Display Banner */}
        {generatedKey && (
          <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="flex items-start gap-3">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950">Nouvelle Clé API Générée !</h4>
                <p className="text-xs text-emerald-800 font-semibold mt-1">
                  Veuillez copier cette clé maintenant. Pour votre sécurité, elle **ne sera plus jamais réaffichée**.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <div className="flex-1 bg-zinc-950 text-emerald-400 font-mono text-xs p-3.5 rounded-xl break-all select-all flex items-center justify-between border border-zinc-800">
                <span>{generatedKey}</span>
              </div>
              <button
                onClick={handleCopy}
                className="px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-extrabold transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <span>Copier la clé</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Api key block */}
        <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600">
                <Key className="h-4 w-4" />
              </span>
              <h3 className="font-extrabold text-sm text-zinc-900">Vos Clés API</h3>
            </div>
            {!showCreateForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateForm(true)}
                className="h-8 border-zinc-200 text-xs font-bold text-zinc-700 flex items-center gap-1 hover:bg-zinc-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Créer une clé</span>
              </Button>
            )}
          </div>

          {/* New Key Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateKey} className="p-4 border border-zinc-150 rounded-xl bg-zinc-50/50 space-y-3">
              <h4 className="text-xs font-extrabold text-zinc-700">Nom de la nouvelle clé</h4>
              <div className="flex gap-2">
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ex: Claude Desktop Agent"
                  className="flex-1 text-xs h-9 bg-white"
                  required
                />
                <Button type="submit" disabled={loading} className="h-9 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white">
                  {loading ? 'Génération...' : 'Confirmer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="h-9 text-xs font-bold border-zinc-200 hover:bg-zinc-50"
                >
                  Annuler
                </Button>
              </div>
            </form>
          )}

          {/* Keys List */}
          <div className="border border-zinc-150 rounded-xl overflow-hidden divide-y divide-zinc-100">
            {keys.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400 font-semibold">
                Aucune clé API active. Générez une clé pour connecter des intégrations externes.
              </div>
            ) : (
              keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between p-4 hover:bg-zinc-50/30 transition-colors">
                  <div className="space-y-1">
                    <span className="font-extrabold text-xs text-zinc-850 block">{k.name}</span>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-400 font-semibold">
                      <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">{k.key_prefix}••••••••</span>
                      <span>Créée le {new Date(k.created_at).toLocaleDateString()}</span>
                      <span>
                        Dernière util. : {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Jamais'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeKey(k.id)}
                    className="p-2 px-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold"
                    title="Révoquer la clé"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Révoquer</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MCP info */}
        <div className="border border-zinc-200 rounded-2xl p-6 bg-white space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600">
              <Terminal className="h-4 w-4" />
            </span>
            <h3 className="font-extrabold text-sm text-zinc-900">Model Context Protocol (MCP)</h3>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
            Connectez votre agent IDE local (comme Claude Desktop ou Antigravity) directement à votre base de prospects Vectra en utilisant notre serveur MCP sécurisé.
          </p>
          <div className="bg-zinc-950 p-4 rounded-xl font-mono text-[10px] text-zinc-400 select-all max-w-xl border border-zinc-850">
            npx @vectra-ai/mcp-server --key {keys[0]?.key_prefix || 'vt_live_xxxxx'}••••••••
          </div>
        </div>
      </div>
    </div>
  );
}
