"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Users, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { usePublicCourseDetailQuery, usePublicCourseMentorsQuery } from "./_queries/courseDetail.queries";
import { cn } from "@/lib/utils";

// Sub-components import
import { CourseHero } from "./_components/CourseHero";
import { Mentors } from "./_components/Mentors";
import { Overview } from "./_components/Overview";
import { CourseOutline } from "./_components/CourseOutline";
import { TestSeriesOutline } from "./_components/TestSeriesOutline";
import { BriefInfoCard } from "./_components/BriefInfoCard";
import { EnrollmentDialog } from "./_components/EnrollmentDialog";

export default function PublicCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: course, isLoading: isDetailLoading, error: detailError } = usePublicCourseDetailQuery(courseId);
  const { data: streamMentors, isLoading: isMentorsLoading } = usePublicCourseMentorsQuery(courseId);

  // Enrollment Dialog State
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);

  // Tabs state - "mentors" is default active as requested
  const [activeTab, setActiveTab] = useState< "overview" | "mentors" |"outline" | "testSeries">("overview");

  if (isDetailLoading) {
    return (
      <div className="min-h-screen bg-slate-50/20 dark:bg-slate-950/5 pt-24 px-4 max-w-7xl mx-auto space-y-8 animate-pulse">
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

  if (detailError || !course) {
    return (
      <div className="min-h-screen bg-slate-50/20 dark:bg-slate-950/5 pt-24 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-full mb-4 border border-red-100 dark:border-red-900/40">
          <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-955 dark:text-slate-55 mb-2">Course Not Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          The course you are looking for may have been unpublished, closed, or does not exist.
        </p>
        <Link href="/courses">
          <button className="h-10 px-5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer">
            Back to Courses
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/20 dark:bg-slate-950/5">
      
      {/* 1. Full-Width Course Hero */}
      <CourseHero
        title={course.title}
        description={course.description}
        banner={course.banner}
        streams={course.streams}
        startDate={course.startDate}
      />

      {/* 2. Content Container (Restricted Max Width) */}
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
              <span className="hidden sm:inline">Overview</span>
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
              <span className="hidden sm:inline">Mentors</span>
            </button>
            
            <button
              onClick={() => setActiveTab("outline")}
              className={cn(
                "px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2",
                activeTab === "outline"
                  ? "border-violet-600 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              title="Course Outline"
            >
              <GraduationCap className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Course Outline</span>
            </button>
            <button
              onClick={() => setActiveTab("testSeries")}
              className={cn(
                "px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2",
                activeTab === "testSeries"
                  ? "border-violet-600 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              title="Test Series Outline"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Test Series Outline</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs min-h-[300px]">
            {activeTab === "mentors" && (
              <Mentors streamMentors={streamMentors} isLoading={isMentorsLoading} />
            )}
            {activeTab === "overview" && (
              <Overview onEnrollClick={() => setIsEnrollmentOpen(true)} />
            )}
            {activeTab === "outline" && (
              <CourseOutline courseId={course.id} />
            )}
            {activeTab === "testSeries" && (
              <TestSeriesOutline
                testSeriesId={course.testSeriesId}
                testSeriesTitle={course.testSeriesTitle}
                testSeriesPrice={course.testSeriesPrice}
              />
            )}
          </div>

        </div>

        {/* Right Column (BriefInfoCard Purchase Sidebar) */}
        <BriefInfoCard
          coursePrice={course.price}
          testSeriesPrice={course.testSeriesPrice}
          banner={course.banner}
          title={course.title}
          testSeriesId={course.testSeriesId}
          onEnrollClick={() => setIsEnrollmentOpen(true)}
        />

      </div>

      {/* Course subject configuration and enrollment wizard */}
      <EnrollmentDialog
        isOpen={isEnrollmentOpen}
        onClose={() => setIsEnrollmentOpen(false)}
        course={course}
      />

    </div>
  );
}