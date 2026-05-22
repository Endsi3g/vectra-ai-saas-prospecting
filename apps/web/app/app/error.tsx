'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app error boundary]', error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="text-center max-w-sm">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Erreur inattendue</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Cette section a rencontré un problème. Tes données sont en sécurité.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
      </div>
    </div>
  );
}
