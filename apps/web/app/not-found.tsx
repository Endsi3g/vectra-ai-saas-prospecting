import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-6">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <svg viewBox="0 0 120 120" className="w-24 h-24 mx-auto mb-6 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="60" cy="60" r="48" strokeDasharray="8 4" />
          <text x="60" y="68" textAnchor="middle" fontSize="28" fontWeight="600" fill="currentColor" stroke="none">404</text>
        </svg>

        <h1 className="text-2xl font-semibold mb-2">Page introuvable</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>

        <Link
          href="/app"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors"
        >
          Retour à l&apos;application
        </Link>
      </div>
    </div>
  );
}
