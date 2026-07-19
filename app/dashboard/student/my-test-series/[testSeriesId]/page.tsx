"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ClipboardList, AlertCircle, RefreshCw, Sparkles, Clock, Calendar, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentHeader } from "../../layout";
import { useStudentTestSeriesDetailQuery } from "../_queries/my-test-series.queries";
import Image from "next/image";

export default function StudentTestSeriesDetailPage() {
  const params = useParams();
  const testSeriesId = params.testSeriesId as string;

  const { data: response, isLoading, isError, error, refetch } = useStudentTestSeriesDetailQuery(testSeriesId);
  const detail = response?.data;

  return (
    <>
      <StudentHeader>
        <div className="flex items-center gap-3 w-full">
          <Link href="/dashboard/student/my-test-series">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border hover:bg-muted/60 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
              <span>My Classroom</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/90">Test Series</span>
            </div>
            <h1 className="text-xs md:text-sm font-bold tracking-tight text-foreground select-none mt-0.5 line-clamp-1">
              {detail?.testSeries.name || "Test Series Details"}
            </h1>
          </div>
        </div>
      </StudentHeader>

      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <Skeleton className="h-40 w-full rounded-2xl bg-muted/60" />
            <Skeleton className="h-8 w-1/4 rounded bg-muted/60" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-16 w-full rounded-xl bg-muted/60" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <h3 className="text-base font-semibold text-foreground">Failed to Load Test Series Details</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              {error instanceof Error ? error.message : "You might not be enrolled in this test series or your access has expired."}
            </p>
            <div className="flex gap-3 mt-4">
              <Link href="/dashboard/student/my-test-series">
                <Button variant="outline" size="sm" className="min-h-[44px]">
                  Go Back
                </Button>
              </Link>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="gap-2 min-h-[44px]"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Success Content */}
        {!isLoading && !isError && detail && (
          <>
            {/* Test Series Info Card */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
              <div className="relative aspect-video w-full sm:w-[32%] shrink-0 overflow-hidden rounded-xl bg-muted border border-border/40 shadow-xs">
                {detail.testSeries.banner ? (
                  <Image
                    src={detail.testSeries.banner}
                    alt={detail.testSeries.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 30vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-1.5">
                  <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug">
                    {detail.testSeries.name}
                  </h2>
                  {detail.testSeries.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {detail.testSeries.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tests List Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground tracking-tight select-none flex items-center gap-2">
                  <ClipboardList className="h-4.5 w-4.5 text-primary" />
                  Tests List
                </h3>
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {detail.tests.length} tests
                </span>
              </div>

              {detail.tests.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center">
                  <ClipboardList className="h-8 w-8 text-muted-foreground/60 mb-2" />
                  <h4 className="font-semibold text-sm text-foreground">No Tests Assigned</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    There are no mock tests uploaded in this test series yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detail.tests.map((test) => {
                    const scheduledDate = new Date(test.scheduledAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    const scheduledTime = new Date(test.scheduledAt).getTime();
                    const nowTime = Date.now();
                    const liveEndTime = scheduledTime + test.durationMinutes * 60 * 1000;
                    
                    const canViewInstructions = scheduledTime - 5 * 60 * 1000 <= nowTime;
                    const isUpcoming = scheduledTime > nowTime;
                    const isMissed = nowTime > liveEndTime + 2 * 60 * 1000 && !test.attemptStatus;

                    return (
                      <div
                        key={test.testId}
                        className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-foreground line-clamp-1">
                            {test.name}
                          </h4>
                          {test.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {test.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              Scheduled: {scheduledDate}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              Duration: {test.durationMinutes} mins
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          {isUpcoming && !canViewInstructions ? (
                            <Button
                              disabled
                              variant="secondary"
                              className="text-xs font-bold w-full sm:w-auto min-h-[40px] px-4"
                            >
                              Locked (Upcoming)
                            </Button>
                          ) : test.attemptStatus === "STARTED" ? (
                            <Link href={`/dashboard/student/my-test-series/${testSeriesId}/tests/${test.testId}/attempt`}>
                              <Button
                                className="text-xs font-bold gap-2 w-full sm:w-auto min-h-[40px] px-4 bg-amber-600 hover:bg-amber-600/90 text-white"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                Resume Test
                              </Button>
                            </Link>
                          ) : test.attemptStatus === "SUBMITTED" ? (
                            <Button
                              disabled
                              className="text-xs font-bold gap-2 w-full sm:w-auto min-h-[40px] px-4"
                            >
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Evaluating...
                            </Button>
                          ) : test.attemptStatus === "EVALUATED" ? (
                            <Link href={`/dashboard/student/my-test-series/${testSeriesId}/tests/${test.testId}/report`}>
                              <Button
                                variant="outline"
                                className="text-xs font-bold gap-2 w-full sm:w-auto min-h-[40px] px-4 border-primary text-primary hover:bg-primary/5"
                              >
                                View Report
                              </Button>
                            </Link>
                          ) : isMissed ? (
                            <Link href={`/dashboard/student/my-test-series/${testSeriesId}/tests/${test.testId}/attempt`}>
                              <Button
                                className="text-xs font-bold gap-2 w-full sm:w-auto min-h-[40px] px-4 bg-emerald-600 hover:bg-emerald-600/90 text-white"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                Practice Test
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/dashboard/student/my-test-series/${testSeriesId}/tests/${test.testId}/attempt`}>
                              <Button
                                className="text-xs font-bold gap-2 w-full sm:w-auto min-h-[40px] px-4"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                {isUpcoming ? "View Instructions" : "Attempt Test"}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
