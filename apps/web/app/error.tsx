'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[error boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-6">
      <div className="text-center max-w-md">
        <svg viewBox="0 0 120 120" className="w-24 h-24 mx-auto mb-6 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="60" cy="60" r="48" />
          <line x1="60" y1="38" x2="60" y2="68" strokeLinecap="round" />
          <circle cx="60" cy="80" r="2" fill="currentColor" stroke="none" />
        </svg>

        <h1 className="text-2xl font-semibold mb-2">Une erreur est survenue</h1>
        <p className="text-zinc-400 text-sm mb-2">
          Quelque chose s&apos;est mal passé. Tu peux réessayer ou retourner à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="text-zinc-600 text-xs mb-6 font-mono">ref: {error.digest}</p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors"
          >
            Réessayer
          </button>
          <a
            href="/app"
            className="border border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:border-zinc-500 transition-colors"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}
