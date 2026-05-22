'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Mail, Play, Pause, Archive, Trash2, Users, BarChart2,
  Zap, ChevronRight, Copy, Loader2, AlertCircle,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonCampaignCard } from '@/components/ui/skeletons';

interface SequenceItem {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'paused' | 'archived';
  is_template: boolean;
  template_slug: string | null;
  send_hour: number;
  created_at: string;
  sequence_steps: { id: string }[];
  sequence_enrollments: { count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  active: 'bg-emerald-500/20 text-emerald-400',
  paused: 'bg-amber-500/20 text-amber-400',
  archived: 'bg-zinc-800 text-zinc-500',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  active: 'Active',
  paused: 'En pause',
  archived: 'Archivée',
};

const BUILT_IN_TEMPLATES: Array<{
  slug: string; name: string; description: string; steps: number; icon: string;
}> = [
  { slug: 'cold-saas', name: 'Cold Outreach SaaS', description: 'Séquence 3 steps pour prospecter des SaaS B2B.', steps: 3, icon: '🚀' },
  { slug: 'relance-agence', name: 'Relance Agence', description: 'Séquence de relance pour une agence marketing/web.', steps: 4, icon: '📢' },
  { slug: 'partenariat-bd', name: 'Partenariat BD', description: 'Approche partenariat et business development.', steps: 3, icon: '🤝' },
  { slug: 'recrutement', name: 'Recrutement', description: 'Séquence de sourcing pour recruteurs.', steps: 3, icon: '👥' },
  { slug: 'consultant', name: 'Consultant Freelance', description: 'Prospecter des missions en tant que consultant.', steps: 4, icon: '💼' },
];

export default function SequencesPage() {
  const router = useRouter();
  const [sequences, setSequences] = useState<SequenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'mine' | 'templates'>('mine');

  useEffect(() => { fetchSequences(); }, []);

  async function fetchSequences() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sequences');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      setSequences(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    setActionLoading(id + '-status');
    await fetch(`/api/sequences/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setActionLoading(null);
    fetchSequences();
  }

  async function deleteSequence(id: string) {
    if (!confirm('Supprimer cette séquence ? Cette action est irréversible.')) return;
    setActionLoading(id + '-del');
    await fetch(`/api/sequences/${id}`, { method: 'DELETE' });
    setActionLoading(null);
    fetchSequences();
  }

  async function cloneFromTemplate(templateSlug: string, name: string) {
    setActionLoading('tmpl-' + templateSlug);
    const res = await fetch('/api/sequences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${name} (copie)`, from_template_slug: templateSlug }),
    });
    setActionLoading(null);
    if (res.ok) {
      const seq = await res.json();
      router.push(`/app/sequences/${seq.id}`);
    }
  }

  const mySequences = sequences.filter((s) => !s.is_template);
  const templateSeqs = sequences.filter((s) => s.is_template);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Séquences</h1>
          <p className="text-sm text-zinc-400 mt-1">Automatisez vos campagnes email multi-steps.</p>
        </div>
        <Link
          href="/app/sequences/new"
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle séquence
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {(['mine', 'templates'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            {t === 'mine' ? 'Mes séquences' : 'Templates'}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* My sequences tab */}
      {tab === 'mine' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCampaignCard key={i} />)}
            </div>
          ) : mySequences.length === 0 ? (
            <EmptyState
              icon="zap"
              title="Aucune séquence"
              description="Créez votre première séquence email ou démarrez depuis un template."
              action={{ label: 'Créer une séquence', href: '/app/sequences/new' }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mySequences.map((seq) => (
                <SequenceCard
                  key={seq.id}
                  seq={seq}
                  onStatus={updateStatus}
                  onDelete={deleteSequence}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates tab */}
      {tab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {BUILT_IN_TEMPLATES.map((tpl) => (
            <div key={tpl.slug} className="border border-zinc-800 rounded-xl p-5 flex flex-col gap-3 hover:border-zinc-600 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl">{tpl.icon}</span>
                  <h3 className="text-base font-semibold mt-2">{tpl.name}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{tpl.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{tpl.steps} steps</span>
              </div>
              <button
                onClick={() => cloneFromTemplate(tpl.slug, tpl.name)}
                disabled={actionLoading === 'tmpl-' + tpl.slug}
                className="mt-auto flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === 'tmpl-' + tpl.slug ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
                Utiliser ce template
              </button>
            </div>
          ))}

          {/* User saved templates */}
          {templateSeqs.map((seq) => (
            <SequenceCard
              key={seq.id}
              seq={seq}
              onStatus={updateStatus}
              onDelete={deleteSequence}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── SequenceCard ──────────────────────────────────────────────────────────────

function SequenceCard({ seq, onStatus, onDelete, actionLoading }: {
  seq: SequenceItem;
  onStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  actionLoading: string | null;
}) {
  const stepsCount = seq.sequence_steps?.length ?? 0;
  const enrollCount = seq.sequence_enrollments?.[0]?.count ?? 0;
  const isLoading = actionLoading?.startsWith(seq.id);

  return (
    <div className="border border-zinc-800 rounded-xl p-5 flex flex-col gap-4 hover:border-zinc-600 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[seq.status]}`}>
              {STATUS_LABELS[seq.status]}
            </span>
          </div>
          <h3 className="text-base font-semibold truncate">{seq.name}</h3>
          {seq.description && <p className="text-sm text-zinc-400 mt-0.5 line-clamp-2">{seq.description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{stepsCount} step{stepsCount !== 1 ? 's' : ''}</span>
        <span className="flex items-center gap-1.5"><Users className="h-3 w-3" />{enrollCount} lead{enrollCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
        {/* View stats */}
        <Link
          href={`/app/sequences/${seq.id}`}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <BarChart2 className="h-3 w-3" />
          Voir les stats
          <ChevronRight className="h-3 w-3" />
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          ) : (
            <>
              {seq.status === 'active' && (
                <button onClick={() => onStatus(seq.id, 'paused')} title="Mettre en pause">
                  <Pause className="h-4 w-4 text-zinc-400 hover:text-amber-400 transition-colors" />
                </button>
              )}
              {(seq.status === 'draft' || seq.status === 'paused') && (
                <button onClick={() => onStatus(seq.id, 'active')} title="Activer">
                  <Play className="h-4 w-4 text-zinc-400 hover:text-emerald-400 transition-colors" />
                </button>
              )}
              {seq.status !== 'archived' && (
                <button onClick={() => onStatus(seq.id, 'archived')} title="Archiver">
                  <Archive className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition-colors" />
                </button>
              )}
              <button onClick={() => onDelete(seq.id)} title="Supprimer">
                <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-400 transition-colors" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
