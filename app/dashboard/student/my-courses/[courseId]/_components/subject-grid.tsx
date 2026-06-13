"use client";

import Link from "next/link";
import { BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { SubjectSyllabus } from "../_api/course-detail.api";

interface SubjectGridProps {
  courseId: string;
  subjects: SubjectSyllabus[];
}

export function SubjectGrid({ courseId, subjects }: SubjectGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
        <GraduationCap className="h-4 w-4 text-primary" />
        <span>Subjects in Course</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          // Mock some progress data for the visual presentation
          const progress = Math.floor(Math.random() * 40) + 10; // 10% to 50%

          return (
            <Link
              key={subject.courseSubjectId}
              href={`/dashboard/student/my-courses/${courseId}/subjects/${subject.courseSubjectId}`}
              className="group rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 flex flex-col justify-between gap-4 min-h-[44px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {subject.subjectName}
                    </h4>
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground uppercase">
                      {subject.subjectType}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>

              {/* Progress and Chapters detail */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{subject.chapters.length} Chapters</span>
                  <span className="font-semibold text-foreground">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
