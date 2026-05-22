'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, ChevronUp, ChevronDown,
  Loader2, Save, ArrowLeft, Info,
} from 'lucide-react';

interface Step {
  id: string; // local temp id
  position: number;
  delay_days: number;
  subject_a: string;
  subject_b: string;
  body: string;
  ab_test_enabled: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, h) => ({
  value: h,
  label: `${String(h).padStart(2, '0')}:00`,
}));

const VARIABLE_HINTS = ['{{first_name}}', '{{last_name}}', '{{full_name}}', '{{company}}'];

function newStep(position: number): Step {
  return {
    id: crypto.randomUUID(),
    position,
    delay_days: position === 0 ? 0 : 3,
    subject_a: '',
    subject_b: '',
    body: '',
    ab_test_enabled: false,
  };
}

export default function NewSequencePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sendHour, setSendHour] = useState(9);
  const [steps, setSteps] = useState<Step[]>([newStep(0)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addStep() {
    setSteps((prev) => [...prev, newStep(prev.length)]);
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, position: i })));
  }

  function moveStep(id: string, dir: 'up' | 'down') {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === prev.length - 1)) return prev;
      const next = [...prev];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      const tmp = next[idx]!;
      next[idx] = next[swap]!;
      next[swap] = tmp;
      return next.map((s, i) => ({ ...s, position: i }));
    });
  }

  function updateStep<K extends keyof Step>(id: string, key: K, value: Step[K]) {
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, [key]: value } : s));
  }

  async function handleSave(activate = false) {
    if (!name.trim()) { setError('Le nom de la séquence est requis.'); return; }
    if (steps.length === 0) { setError('Ajoutez au moins un step.'); return; }
    const emptyStep = steps.find((s) => !s.subject_a.trim() || !s.body.trim());
    if (emptyStep) { setError(`Le step ${emptyStep.position + 1} doit avoir un sujet et un corps.`); return; }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          send_hour: sendHour,
          status: activate ? 'active' : 'draft',
          steps: steps.map((s, i) => ({
            position: i,
            delay_days: s.delay_days,
            subject_a: s.subject_a,
            subject_b: s.ab_test_enabled ? s.subject_b : null,
            body: s.body,
            ab_test_enabled: s.ab_test_enabled,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur création');
      router.push(`/app/sequences/${data.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold">Nouvelle séquence</h1>
          <p className="text-sm text-zinc-400">Construisez votre séquence email multi-steps.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Meta */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-zinc-300">Paramètres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400">Nom de la séquence *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cold Outreach SaaS Q3"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400">Heure d&apos;envoi fixe</label>
            <select
              value={sendHour}
              onChange={(e) => setSendHour(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            >
              {HOURS.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-400">Description (optionnel)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Séquence pour cibler les SaaS B2B en croissance..."
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>
        <div className="flex items-start gap-2 bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-400">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Utilisez <code className="text-zinc-300">{'{{'}<span>first_name</span>{'}}'}</code>, <code className="text-zinc-300">{'{{'}<span>company</span>{'}}'}</code> etc. pour personnaliser les messages.</span>
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">{steps.length} step{steps.length !== 1 ? 's' : ''}</h2>
          <div className="flex gap-1 text-xs text-zinc-500">
            {VARIABLE_HINTS.map((v) => (
              <code key={v} className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{v}</code>
            ))}
          </div>
        </div>

        {steps.map((step, idx) => (
          <StepCard
            key={step.id}
            step={step}
            index={idx}
            total={steps.length}
            onUpdate={updateStep}
            onRemove={removeStep}
            onMove={moveStep}
          />
        ))}

        <button
          onClick={addStep}
          className="flex items-center justify-center gap-2 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl py-4 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter un step
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="flex items-center gap-2 border border-zinc-700 text-zinc-300 hover:text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder en brouillon
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="flex items-center gap-2 bg-white text-black hover:bg-zinc-100 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Créer et activer
        </button>
      </div>
    </div>
  );
}

// ── StepCard ──────────────────────────────────────────────────────────────────

function StepCard({ step, index, total, onUpdate, onRemove, onMove }: {
  step: Step;
  index: number;
  total: number;
  onUpdate: <K extends keyof Step>(id: string, key: K, value: Step[K]) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      {/* Step header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900">
        <div className="flex flex-col gap-0.5">
          <button onClick={() => onMove(step.id, 'up')} disabled={index === 0} className="text-zinc-600 hover:text-zinc-300 disabled:opacity-30 transition-colors">
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onMove(step.id, 'down')} disabled={index === total - 1} className="text-zinc-600 hover:text-zinc-300 disabled:opacity-30 transition-colors">
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300 shrink-0">
          {index + 1}
        </div>
        <span className="text-sm font-medium flex-1 truncate">
          {step.subject_a || `Step ${index + 1} — sujet non défini`}
        </span>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {index > 0 && <span>J+{step.delay_days}</span>}
          {step.ab_test_enabled && <span className="bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded">A/B</span>}
        </div>
        <button onClick={() => setExpanded((e) => !e)} className="text-zinc-400 hover:text-white transition-colors text-xs">
          {expanded ? 'Réduire' : 'Développer'}
        </button>
        {total > 1 && (
          <button onClick={() => onRemove(step.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Step body */}
      {expanded && (
        <div className="p-4 flex flex-col gap-3 bg-zinc-950">
          {/* Delay */}
          {index > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-xs text-zinc-400 w-32 shrink-0">Délai (jours)</label>
              <input
                type="number"
                min={1}
                max={90}
                value={step.delay_days}
                onChange={(e) => onUpdate(step.id, 'delay_days', Number(e.target.value))}
                className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
              <span className="text-xs text-zinc-500">jours après le step précédent, à l&apos;heure configurée</span>
            </div>
          )}

          {/* Subject A */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400">
              {step.ab_test_enabled ? 'Sujet A' : 'Sujet email *'}
            </label>
            <input
              value={step.subject_a}
              onChange={(e) => onUpdate(step.id, 'subject_a', e.target.value)}
              placeholder="Question rapide sur {{company}}..."
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* A/B toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpdate(step.id, 'ab_test_enabled', !step.ab_test_enabled)}
              className={`relative w-9 h-5 rounded-full transition-colors ${step.ab_test_enabled ? 'bg-violet-500' : 'bg-zinc-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${step.ab_test_enabled ? 'translate-x-4' : ''}`} />
            </button>
            <span className="text-xs text-zinc-400">Test A/B sur l&apos;objet (winner automatique par taux d&apos;ouverture)</span>
          </div>

          {/* Subject B */}
          {step.ab_test_enabled && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400">Sujet B</label>
              <input
                value={step.subject_b}
                onChange={(e) => onUpdate(step.id, 'subject_b', e.target.value)}
                placeholder="Variante objet pour {{first_name}}..."
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>
          )}

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400">Corps de l&apos;email *</label>
            <textarea
              value={step.body}
              onChange={(e) => onUpdate(step.id, 'body', e.target.value)}
              rows={6}
              placeholder={`Bonjour {{first_name}},\n\nJ'ai vu que {{company}} cherche à...`}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-y font-mono leading-relaxed"
            />
            <p className="text-xs text-zinc-600">Le lien de désabonnement est ajouté automatiquement.</p>
          </div>
        </div>
      )}
    </div>
  );
}
