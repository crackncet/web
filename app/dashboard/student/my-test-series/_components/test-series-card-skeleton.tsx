"use client";

export function TestSeriesCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm animate-pulse">
      <div className="flex flex-col gap-3">
        {/* Banner skeleton */}
        <div className="aspect-[16/9] w-full rounded-lg bg-muted" />

        {/* Details skeleton */}
        <div className="flex flex-col gap-2">
          {/* Badge skeleton */}
          <div className="h-5 w-16 rounded-full bg-muted" />

          {/* Title skeleton */}
          <div className="h-5 w-3/4 rounded bg-muted" />

          {/* Description skeleton */}
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />

          {/* Enrolled date skeleton */}
          <div className="mt-1 flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded-full bg-muted" />
            <div className="h-3 w-28 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
