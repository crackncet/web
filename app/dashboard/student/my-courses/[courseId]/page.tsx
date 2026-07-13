"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentHeader } from "../../layout";
import { useStudentCourseDetailQuery } from "./_queries/course-detail.queries";
import { CourseAnalyticsPlaceholder } from "./_components/course-analytics-placeholder";
import { SubjectGrid } from "./_components/subject-grid";
import Image from "next/image";

export default function StudentCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: response, isLoading, isError, error, refetch } = useStudentCourseDetailQuery(courseId);
  const syllabus = response?.data;

  // Extract first subject and first topic to serve as default safe links for mock items
  const firstSubject = syllabus?.subjects?.[0];
  const firstTopic = firstSubject?.chapters?.[0]?.topics?.[0];

  return (
    <>
      <StudentHeader>
        <div className="flex items-center gap-3 w-full">
          <Link href="/dashboard/student/my-courses">
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
              <span className="text-primary/90">Courses</span>
            </div>
            <h1 className="text-xs md:text-sm font-bold tracking-tight text-foreground select-none mt-0.5 line-clamp-1">
              {syllabus?.course.title || "Course Details"}
            </h1>
          </div>
        </div>
      </StudentHeader>

      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <Skeleton className="h-40 w-full rounded-2xl bg-muted/60" />
            <Skeleton className="h-32 w-full rounded-2xl bg-muted/60" />
            <Skeleton className="h-32 w-full rounded-2xl bg-muted/60" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-28 w-full rounded-xl bg-muted/60" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <h3 className="text-base font-semibold text-foreground">Failed to Load Course Syllabus</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              {error instanceof Error ? error.message : "You might not be enrolled in this course or your subscription has expired."}
            </p>
            <div className="flex gap-3 mt-4">
              <Link href="/dashboard/student/my-courses">
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
        {!isLoading && !isError && syllabus && (
          <>
                       
            {/* Course Summary Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
              <div className="relative aspect-video w-full sm:w-[32%] shrink-0 overflow-hidden rounded-xl bg-muted border border-border/40 shadow-xs">
                {syllabus.course.banner ? (
                  <Image
                    src={syllabus.course.banner}
                    alt={syllabus.course.title}
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
                    {syllabus.course.title}
                  </h2>
                  {syllabus.course.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {syllabus.course.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Analytics Section */}
            <CourseAnalyticsPlaceholder
              overallProgressPercentage={syllabus.overallProgressPercentage}
              stats={syllabus.stats}
            />

            {/* Subjects Grid Section */}
            {syllabus.subjects.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <h4 className="font-semibold text-sm text-foreground">No Subjects Available</h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  There are no subjects or chapters assigned to you in this course.
                </p>
              </div>
            ) : (
              <SubjectGrid courseId={courseId} subjects={syllabus.subjects} />
            )}
          </>
        )}
      </div>
    </>
  );
}
