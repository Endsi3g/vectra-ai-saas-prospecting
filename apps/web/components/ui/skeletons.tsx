import React from 'react';

function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded-md ${className}`} />
  );
}

export function SkeletonLeadCard() {
  return (
    <div className="border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Shimmer className="h-9 w-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-3 w-48" />
        </div>
        <Shimmer className="h-5 w-10 rounded-full" />
      </div>
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-4/5" />
    </div>
  );
}

export function SkeletonCampaignCard() {
  return (
    <div className="border border-zinc-800 rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="h-3 w-24" />
        </div>
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-3 w-20" />
      </div>
    </div>
  );
}

export function SkeletonMessageRow() {
  return (
    <div className="border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Shimmer className="h-4 w-48" />
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-3/4" />
      <div className="flex gap-2 pt-1">
        <Shimmer className="h-8 w-24 rounded-lg" />
        <Shimmer className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="border border-zinc-800 rounded-xl p-4 space-y-3">
      <Shimmer className="h-4 w-24" />
      <Shimmer className="h-8 w-16" />
      <Shimmer className="h-3 w-32" />
    </div>
  );
}

export function SkeletonConversationRow() {
  return (
    <div className="flex items-center gap-3 p-3 border-b border-zinc-800 last:border-0">
      <Shimmer className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-40" />
        <Shimmer className="h-3 w-56" />
      </div>
      <Shimmer className="h-3 w-12" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border border-zinc-800 rounded-xl">
            <Shimmer className="h-7 w-7 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3 w-64" />
              <Shimmer className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonLeadList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: count }).map((_, i) => <SkeletonLeadCard key={i} />)}
    </div>
  );
}

export function SkeletonMessageList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: count }).map((_, i) => <SkeletonMessageRow key={i} />)}
    </div>
  );
}

export function SkeletonInboxList({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
      {Array.from({ length: count }).map((_, i) => <SkeletonConversationRow key={i} />)}
    </div>
  );
}
