import React from 'react';
import Link from 'next/link';

type IconType = 'search' | 'inbox' | 'users' | 'chart' | 'mail' | 'zap' | 'book' | 'target';

const ICONS: Record<IconType, React.ReactNode> = {
  search: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="28" cy="28" r="16" />
      <line x1="40" y1="40" x2="54" y2="54" />
      <line x1="22" y1="28" x2="34" y2="28" />
      <line x1="28" y1="22" x2="28" y2="34" />
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="8" y="16" width="48" height="36" rx="4" />
      <path d="M8 28 L32 42 L56 28" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="24" cy="22" r="10" />
      <path d="M4 54 C4 42 44 42 44 54" />
      <circle cx="46" cy="24" r="8" />
      <path d="M36 54 C38 46 60 46 60 54" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="8" y1="56" x2="56" y2="56" />
      <line x1="8" y1="8" x2="8" y2="56" />
      <rect x="16" y="32" width="8" height="24" rx="2" />
      <rect x="28" y="20" width="8" height="36" rx="2" />
      <rect x="40" y="12" width="8" height="44" rx="2" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="6" y="14" width="52" height="36" rx="4" />
      <path d="M6 20 L32 38 L58 20" />
      <line x1="6" y1="50" x2="22" y2="36" />
      <line x1="58" y1="50" x2="42" y2="36" />
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="36,4 12,36 30,36 28,60 52,28 34,28" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M10 8 C10 8 20 4 32 8 L32 56 C20 52 10 56 10 56 Z" />
      <path d="M54 8 C54 8 44 4 32 8 L32 56 C44 52 54 56 54 56 Z" />
      <line x1="32" y1="8" x2="32" y2="56" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="32" cy="32" r="24" />
      <circle cx="32" cy="32" r="14" />
      <circle cx="32" cy="32" r="5" />
      <line x1="32" y1="4" x2="32" y2="12" />
      <line x1="32" y1="52" x2="32" y2="60" />
      <line x1="4" y1="32" x2="12" y2="32" />
      <line x1="52" y1="32" x2="60" y2="32" />
    </svg>
  ),
};

interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ icon = 'search', title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 text-center ${className}`}>
      <div className="h-16 w-16 text-zinc-600 mb-5">
        {ICONS[icon]}
      </div>
      <h3 className="text-base font-semibold text-zinc-200 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-xs leading-relaxed mb-6">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
