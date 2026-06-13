"use client";

import { StudentHeader } from "../layout";
import { useStudentCoursesQuery } from "./_queries/my-courses.queries";
import { CourseCard } from "./_components/course-card";
import { CourseCardSkeleton } from "./_components/course-card-skeleton";
import { BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyCoursesPage() {
  const { data, isLoading, isError, error, refetch } = useStudentCoursesQuery();

  const courses = data?.data || [];

  return (
    <>
      <StudentHeader>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-bold text-foreground md:text-xl">My Courses</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Access your study materials, lectures, and outline
          </p>
        </div>
      </StudentHeader>

      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <CourseCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <h3 className="text-base font-semibold text-foreground">Failed to Load Courses</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              {error instanceof Error ? error.message : "An unexpected error occurred while loading your courses."}
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
        {!isLoading && !isError && courses.length === 0 && (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No Courses Enrolled</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
              You are not enrolled in any courses yet. Once you purchase or enroll in a course, it will appear here.
            </p>
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && !isError && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}