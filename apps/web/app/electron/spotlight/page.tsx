'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowRight, Loader2, User } from 'lucide-react';

interface LeadResult {
  name: string;
  company: string;
  role: string;
  email?: string;
  match_score?: number;
}

export default function SpotlightPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LeadResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.electron?.closeSpotlight?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const resp = await fetch('/api/sourcing/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), max_results: 3 }),
      });

      if (!resp.ok) throw new Error('Erreur de recherche');
      const data = await resp.json() as { candidates?: LeadResult[] };
      setResults(data.candidates ?? []);
    } catch {
      setError('Impossible de lancer la recherche');
    } finally {
      setLoading(false);
    }
  }

  function openInApp() {
    window.electron?.closeSpotlight?.();
    // The main app will navigate to sourcing with the query pre-filled
    window.dispatchEvent(new CustomEvent('spotlight:open-sourcing', { detail: { query } }));
  }

  return (
    <div
      className="w-full h-full bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-700/50 shadow-2xl overflow-hidden flex flex-col"
      onDrop={(e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).map((f) => f.path ?? '');
        if (files.length > 0) window.electron?.notifyPdfDropped?.(files);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700/50">
        <Search className="h-4 w-4 text-zinc-400 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Recherche rapide de leads..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
        />
        {loading ? (
          <Loader2 className="h-4 w-4 text-zinc-400 animate-spin" />
        ) : query ? (
          <button type="submit" className="text-xs text-blue-400 hover:text-blue-300">
            Chercher
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => window.electron?.closeSpotlight?.()}
          className="text-zinc-600 hover:text-zinc-400"
        >
          <X className="h-4 w-4" />
        </button>
      </form>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <p className="text-xs text-red-400 px-4 py-3">{error}</p>
        )}
        {results.length > 0 ? (
          <ul className="divide-y divide-zinc-800">
            {results.map((r, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{r.role} · {r.company}</p>
                </div>
                {r.match_score != null && (
                  <span className="text-xs font-semibold text-green-400 shrink-0">
                    {r.match_score}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : !loading && query && !error ? (
          <p className="text-xs text-zinc-500 px-4 py-3">Aucun résultat.</p>
        ) : !query ? (
          <p className="text-xs text-zinc-600 px-4 py-3">
            Tape une description pour trouver des leads instantanément.
          </p>
        ) : null}
      </div>

      {/* Footer */}
      {query && (
        <div className="border-t border-zinc-700/50 px-4 py-2">
          <button
            onClick={openInApp}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
          >
            <ArrowRight className="h-3 w-3" />
            Ouvrir le sourcing complet
          </button>
        </div>
      )}
    </div>
  );
}

// Extend window type for Electron bridge
declare global {
  interface Window {
    electron?: {
      closeSpotlight?: () => void;
      notifyPdfDropped?: (paths: string[]) => void;
      [key: string]: unknown;
    };
  }
}
