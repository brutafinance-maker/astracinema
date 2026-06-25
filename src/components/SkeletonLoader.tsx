import React from 'react';

/**
 * Shimmer element class helper
 */
const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

export function CardSkeleton() {
  return (
    <div className={`aspect-[2/3] w-full rounded-xl bg-zinc-900/60 border border-zinc-800/50 ${shimmerClass}`} />
  );
}

export function CarouselSkeleton({ title }: { title?: string }) {
  return (
    <div className="space-y-3 px-6 md:px-12 w-full">
      {title ? (
        <div className="h-5 w-48 bg-zinc-900 rounded-md animate-pulse" />
      ) : (
        <div className="h-5 w-32 bg-zinc-900 rounded-md animate-pulse" />
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className={`relative w-full h-[55vh] md:h-[75vh] bg-zinc-950 flex flex-col justify-end p-6 md:p-12 pb-24 md:pb-32 gap-4 ${shimmerClass}`}>
      <div className="space-y-3 max-w-2xl">
        <div className="h-4 w-28 bg-zinc-900 rounded-md animate-pulse" />
        <div className="h-12 w-3/4 bg-zinc-900 rounded-md animate-pulse md:h-16" />
        <div className="h-4 w-full bg-zinc-900 rounded-md animate-pulse" />
        <div className="h-4 w-2/3 bg-zinc-900 rounded-md animate-pulse" />
      </div>
      <div className="flex gap-4">
        <div className="h-12 w-36 bg-zinc-900 rounded-lg animate-pulse" />
        <div className="h-12 w-12 bg-zinc-900 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#09090B] pb-16 flex flex-col">
      {/* Banner Skeleton */}
      <div className={`w-full h-[35vh] md:h-[50vh] bg-zinc-950/80 ${shimmerClass}`} />
      
      {/* Details Area Skeleton */}
      <div className="px-6 md:px-12 -mt-20 md:-mt-32 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative z-10">
        <div className="md:col-span-4 flex flex-col items-center gap-6">
          <div className="w-56 md:w-full aspect-[2/3] bg-zinc-900 rounded-2xl border border-zinc-800 animate-pulse" />
          <div className="w-full space-y-2">
            <div className="h-12 w-full bg-zinc-900 rounded animate-pulse" />
            <div className="h-12 w-full bg-zinc-900 rounded animate-pulse" />
          </div>
        </div>

        <div className="md:col-span-8 flex flex-col gap-6 pt-0 md:pt-12">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-zinc-900 rounded animate-pulse" />
            <div className="h-10 w-2/3 bg-zinc-900 rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-4 w-12 bg-zinc-900 rounded animate-pulse" />
            <div className="h-4 w-12 bg-zinc-900 rounded animate-pulse" />
            <div className="h-4 w-16 bg-zinc-900 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-zinc-900 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-900 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-900 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-zinc-900 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
            <div className="space-y-1">
              <div className="h-3 w-16 bg-zinc-900 rounded animate-pulse" />
              <div className="h-4 w-24 bg-zinc-900 rounded animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-16 bg-zinc-900 rounded animate-pulse" />
              <div className="h-4 w-40 bg-zinc-900 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
