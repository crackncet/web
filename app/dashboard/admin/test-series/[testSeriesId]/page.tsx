"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTestSeriesDetailQuery } from "../_queries/test-series.queries";
import { useExamsQuery } from "../../metadata/_queries/exams.queries";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { TestSeriesInfo } from "./_components/test-series-info";
import { StreamsSubjectsTree } from "./_components/streams-subjects-tree";
import { TestsListSection } from "./_components/tests-list-section";

export default function AdminTestSeriesDetailPage() {
  const params = useParams();
  const testSeriesId = params.testSeriesId as string;

  const { data: detailResponse, isLoading, error } = useTestSeriesDetailQuery(testSeriesId);
  const { data: exams } = useExamsQuery({ isActive: true });

  const detail = detailResponse?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <Skeleton className="h-8 w-1/4 rounded-lg bg-muted/60" />
        <Skeleton className="h-64 w-full rounded-2xl bg-muted/60" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-48 lg:col-span-7 rounded-2xl bg-muted/60" />
          <Skeleton className="h-48 lg:col-span-5 rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 select-none">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
          Test Series Not Found
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mt-2 leading-relaxed">
          The test series you are looking for does not exist or has been deleted.
        </p>
        <Link href="/dashboard/admin/test-series" className="mt-5">
          <Button variant="outline" className="text-xs font-bold gap-1 rounded-xl cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to Test Series
          </Button>
        </Link>
      </div>
    );
  }

  const examName = exams?.find((e) => e.id === detail.examId)?.name || "Exam";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <AdminHeader>
        <div className="flex items-center gap-3 w-full">
          <Link href="/dashboard/admin/test-series">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
              <span>Administration</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/95">Test Series</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-foreground select-none mt-0.5">
              Test Series Details
            </h1>
          </div>
        </div>
      </AdminHeader>

      {/* Info Card Banner */}
      <TestSeriesInfo detail={detail} examName={examName} />

      {/* Two Column Layout: Tests list on the left (wider), Streams & Subjects on the right (narrower) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <TestsListSection testSeriesId={testSeriesId} detail={detail} />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <StreamsSubjectsTree detail={detail} />
        </div>
      </div>
    </div>
  );
}
