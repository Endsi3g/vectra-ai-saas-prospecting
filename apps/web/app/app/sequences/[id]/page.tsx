'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Download, Users, Mail, TrendingUp, TrendingDown,
  CheckCircle2, XCircle, AlertCircle, Loader2, Play, Pause, Edit2,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface StepStat {
  step_id: string;
  position: number;
  subject_a: string;
  subject_b: string | null;
  delay_days: number;
  ab_test_enabled: boolean;
  total_sent: number;
  open_rate: number;
  reply_rate: number;
  bounce_rate: number;
  ab_a_open_rate: number | null;
  ab_b_open_rate: number | null;
}

interface Enrollment {
  id: string;
  status: 'active' | 'completed' | 'stopped' | 'paused';
  stop_reason: string | null;
  current_step: number;
  enrolled_at: string;
  lead_id: string;
}

interface HeatmapSlot { hour: number; count: number }

interface SequenceDetail {
  id: string;
  name: string;
  status: string;
  send_hour: number;
  sequence_steps: { id: string; position: number; subject_a: string }[];
}

interface Stats {
  sequence: SequenceDetail;
  summary: { total_enrolled: number; active: number; completed: number; stopped: number };
  steps: StepStat[];
  heatmap: HeatmapSlot[];
  enrollments: Enrollment[];
}

const STATUS_STOP_LABELS: Record<string, string> = {
  replied: 'A répondu',
  unsubscribed: 'Désabonné',
  bounced: 'Bounce',
  interested: 'Intéressé',
  manual: 'Arrêt manuel',
};

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400',
  completed: 'text-blue-400',
  stopped: 'text-zinc-500',
  paused: 'text-amber-400',
};

export default function SequenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => { fetchStats(); }, [id]);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sequences/${id}/stats`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur');
      setStats(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    const res = await fetch(`/api/sequences/${id}/export`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sequence-${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function toggleStatus() {
    if (!stats) return;
    setStatusLoading(true);
    const newStatus = stats.sequence.status === 'active' ? 'paused' : 'active';
    await fetch(`/api/sequences/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatusLoading(false);
    fetchStats();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState icon="chart" title="Erreur" description={error ?? 'Impossible de charger les stats.'} />
      </div>
    );
  }

  const { sequence, summary, steps, heatmap, enrollments } = stats;
  const maxHeat = Math.max(...heatmap.map((h) => h.count), 1);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/app/sequences')} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">{sequence.name}</h1>
          <p className="text-xs text-zinc-500">
            {sequence.sequence_steps?.length ?? 0} steps · envoi à {String(sequence.send_hour).padStart(2, '0')}:00
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleStatus}
            disabled={statusLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sequence.status === 'active' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
          >
            {statusLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : sequence.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {sequence.status === 'active' ? 'Mettre en pause' : 'Activer'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            Export CSV
          </button>
          <button
            onClick={() => router.push(`/app/sequences/${id}/edit`)}
            className="flex items-center gap-1.5 border border-zinc-700 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <Edit2 className="h-3 w-3" />
            Modifier
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Leads enrôlés" value={summary.total_enrolled} icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Actifs" value={summary.active} icon={<Play className="h-4 w-4" />} color="emerald" />
        <KpiCard label="Complétés" value={summary.completed} icon={<CheckCircle2 className="h-4 w-4" />} color="blue" />
        <KpiCard label="Stoppés" value={summary.stopped} icon={<XCircle className="h-4 w-4" />} color="zinc" />
      </div>

      {/* Steps stats */}
      {steps.length === 0 ? (
        <EmptyState icon="mail" title="Aucun step" description="Ajoutez des steps à cette séquence pour voir les stats." action={{ label: 'Modifier la séquence', href: `/app/sequences/${id}/edit` }} />
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-zinc-300">Stats par step</h2>
          {steps.map((step) => (
            <div key={step.step_id} className="border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">
                      Step {step.position + 1}
                      {step.position > 0 && ` · J+${step.delay_days}`}
                    </span>
                    {step.ab_test_enabled && (
                      <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">A/B test</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-200 truncate max-w-md">{step.subject_a}</p>
                  {step.subject_b && <p className="text-xs text-zinc-500">B: {step.subject_b}</p>}
                </div>
                <span className="text-xs text-zinc-500 shrink-0">{step.total_sent} envoyés</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatBar label="Ouverture" value={step.open_rate} color="blue" />
                <StatBar label="Réponse" value={step.reply_rate} color="emerald" />
                <StatBar label="Bounce" value={step.bounce_rate} color="red" />
              </div>

              {step.ab_test_enabled && (step.ab_a_open_rate !== null || step.ab_b_open_rate !== null) && (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Sujet A</p>
                    <p className="text-sm font-semibold">{step.ab_a_open_rate ?? 0}%</p>
                    <p className="text-xs text-zinc-500">ouverture</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Sujet B</p>
                    <p className="text-sm font-semibold">{step.ab_b_open_rate ?? 0}%</p>
                    <p className="text-xs text-zinc-500">ouverture</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Heatmap */}
      <div className="border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Heatmap d&apos;ouverture (par heure)</h2>
        <div className="flex items-end gap-1 h-20">
          {heatmap.map(({ hour, count }) => (
            <div key={hour} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full rounded-sm bg-blue-500 transition-all"
                style={{ height: `${Math.round((count / maxHeat) * 72)}px`, minHeight: count > 0 ? 4 : 0 }}
                title={`${String(hour).padStart(2, '0')}h : ${count} ouverture${count !== 1 ? 's' : ''}`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-zinc-600 mt-1">
          <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span>
        </div>
      </div>

      {/* Enrollments timeline */}
      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Timeline des leads ({enrollments.length})</h2>
        </div>
        {enrollments.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">Aucun lead enrôlé.</div>
        ) : (
          <div className="divide-y divide-zinc-800 max-h-80 overflow-y-auto">
            {enrollments.slice(0, 100).map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300">
                    {e.lead_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-zinc-200">Lead {e.lead_id.slice(0, 8)}…</p>
                    <p className="text-xs text-zinc-500">Step {e.current_step + 1} · Enrôlé le {new Date(e.enrolled_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={ENROLLMENT_STATUS_COLORS[e.status] ?? 'text-zinc-400'}>
                    {e.status === 'stopped' && e.stop_reason ? STATUS_STOP_LABELS[e.stop_reason] : e.status}
                  </span>
                </div>
              </div>
            ))}
            {enrollments.length > 100 && (
              <div className="px-5 py-2 text-xs text-zinc-600 text-center">+{enrollments.length - 100} leads… Export CSV pour tout voir.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color = 'zinc' }: {
  label: string; value: number; icon: React.ReactNode; color?: string;
}) {
  const colorMap: Record<string, string> = {
    zinc: 'text-zinc-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
  };
  return (
    <div className="border border-zinc-800 rounded-xl p-4">
      <div className={`${colorMap[color] ?? 'text-zinc-400'} mb-2`}>{icon}</div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
  };
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${colorMap[color] ?? 'bg-zinc-500'} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
