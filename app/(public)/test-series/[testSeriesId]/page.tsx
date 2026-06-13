"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Users, BookOpen, Sparkles } from "lucide-react";
import { usePublicTestSeriesDetailQuery, usePublicTestSeriesMentorsQuery } from "./_queries/test-series-detail.queries";
import { cn } from "@/lib/utils";

// Sub-components import
import { TestSeriesHero } from "./_components/TestSeriesHero";
import { Mentors } from "./_components/Mentors";
import { Overview } from "./_components/Overview";
import { TestSeriesOutline } from "./_components/TestSeriesOutline";
import { BriefInfoCard } from "./_components/BriefInfoCard";
import { EnrollmentDialog } from "./_components/EnrollmentDialog";

export default function PublicTestSeriesDetailPage() {
  const params = useParams();
  const testSeriesId = params.testSeriesId as string;

  const { data: testSeries, isLoading: isDetailLoading, error: detailError } = usePublicTestSeriesDetailQuery(testSeriesId);
  const { data: streamMentors, isLoading: isMentorsLoading } = usePublicTestSeriesMentorsQuery(testSeriesId);

  // Enrollment Dialog State
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);

  // Tabs state - "overview" is default active
  const [activeTab, setActiveTab] = useState<"overview" | "outline" | "mentors">("overview");

  if (isDetailLoading) {
    return (
      <div className="min-h-screen bg-slate-50/20 dark:bg-slate-955/5 pt-24 px-4 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-6 bg-muted w-32 rounded" />
        <div className="h-64 bg-muted w-full rounded-3xl" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="h-10 bg-muted w-full max-w-md rounded-xl" />
            <div className="h-48 bg-muted w-full rounded-2xl" />
          </div>
          <div className="w-full lg:w-96 h-96 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  if (detailError || !testSeries) {
    return (
      <div className="min-h-screen bg-slate-50/20 dark:bg-slate-955/5 pt-24 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-red-50 dark:bg-red-955/20 rounded-full mb-4 border border-red-100 dark:border-red-900/40">
          <AlertCircle className="h-10 w-10 text-red-650 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-955 dark:text-slate-55 mb-2">Test Series Not Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          The test series you are looking for may have been unpublished, closed, or does not exist.
        </p>
        <Link href="/test-series">
          <button className="h-10 px-5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer">
            Back to Test Series
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/20 dark:bg-slate-950/5">
      
      {/* 1. Full-Width Hero */}
      <TestSeriesHero
        title={testSeries.name}
        description={testSeries.description}
        banner={testSeries.banner}
        streams={testSeries.streams}
        startDate={testSeries.startDate}
      />

      {/* 2. Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column (Tabs & Details) */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Tabs Navigation */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2",
                activeTab === "overview"
                  ? "border-violet-600 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              title="Overview"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab("outline")}
              className={cn(
                "px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2",
                activeTab === "outline"
                  ? "border-violet-600 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              title="Test Outline"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Test Outline</span>
            </button>

            <button
              onClick={() => setActiveTab("mentors")}
              className={cn(
                "px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2",
                activeTab === "mentors"
                  ? "border-violet-600 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              title="Mentors"
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Mentors</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs min-h-[300px]">
            {activeTab === "overview" && (
              <Overview onEnrollClick={() => setIsEnrollmentOpen(true)} />
            )}
            {activeTab === "outline" && (
              <TestSeriesOutline testSeriesId={testSeries.id} />
            )}
            {activeTab === "mentors" && (
              <Mentors streamMentors={streamMentors} isLoading={isMentorsLoading} />
            )}
          </div>

        </div>

        {/* Right Column (Sidebar BriefInfoCard) */}
        <BriefInfoCard
          price={testSeries.price}
          banner={testSeries.banner}
          title={testSeries.name}
          onEnrollClick={() => setIsEnrollmentOpen(true)}
        />

      </div>

      {/* Enrollment Dialog */}
      <EnrollmentDialog
        isOpen={isEnrollmentOpen}
        onClose={() => setIsEnrollmentOpen(false)}
        testSeries={testSeries}
      />

    </div>
  );
}