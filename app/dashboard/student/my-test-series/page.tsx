"use client";

import { StudentHeader } from "../layout";
import { useStudentTestSeriesQuery } from "./_queries/my-test-series.queries";
import { TestSeriesCard } from "./_components/test-series-card";
import { TestSeriesCardSkeleton } from "./_components/test-series-card-skeleton";
import { ClipboardList, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyTestSeriesPage() {
  const { data, isLoading, isError, error, refetch } = useStudentTestSeriesQuery();

  const testSeriesList = data?.data || [];

  return (
    <>
      <StudentHeader>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-bold text-foreground md:text-xl">My Test Series</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Take practice tests, mock exams, and evaluate performance
          </p>
        </div>
      </StudentHeader>

      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <TestSeriesCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <h3 className="text-base font-semibold text-foreground">Failed to Load Test Series</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              {error instanceof Error ? error.message : "An unexpected error occurred while loading your test series."}
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="mt-4 gap-2 min-h-[44px]"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && testSeriesList.length === 0 && (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No Test Series Enrolled</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
              You are not enrolled in any test series yet. Once you enroll or purchase, they will appear here.
            </p>
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && !isError && testSeriesList.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testSeriesList.map((ts) => (
              <TestSeriesCard key={ts.testSeriesId} testSeries={ts} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
