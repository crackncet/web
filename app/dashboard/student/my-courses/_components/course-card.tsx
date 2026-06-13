"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Calendar } from "lucide-react";
import { EnrolledCourse } from "../_api/my-courses.api";

interface CourseCardProps {
  course: EnrolledCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  // Format enrollment date cleanly
  const enrolledDate = new Date(course.enrolledAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/dashboard/student/my-courses/${course.courseId}`}
      className="block group rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 min-h-[44px]"
    >
      <div className="flex flex-col gap-3">
        {/* Banner image with 16:9 aspect ratio */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
          {course.banner ? (
            <Image
              src={course.banner}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
              <BookOpen className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Course Details */}
        <div className="flex flex-col gap-1.5">
          {/* Exam Badge */}
          <div className="flex">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {course.examName}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Description (if exists) */}
          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          )}

          {/* Enrolled date */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Enrolled on {enrolledDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
