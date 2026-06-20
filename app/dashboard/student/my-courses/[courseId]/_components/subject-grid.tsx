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

      <div className="space-y-3">
        {subjects.map((subject, index) => {
          // Deterministic progress based on subject ID to keep it stable
          const charCodeSum = subject.courseSubjectId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const progress = (charCodeSum % 41) + 10; // 10% to 50%

          return (
            <Link
              key={subject.courseSubjectId}
              href={`/dashboard/student/my-courses/${courseId}/subjects/${subject.courseSubjectId}`}
              className="flex w-full items-center justify-between p-4 text-left font-semibold text-sm md:text-base text-foreground hover:bg-muted/40 border border-border bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-h-[48px] group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] md:text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <span className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {subject.subjectName}
                </span>
                <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground uppercase shrink-0">
                  {subject.subjectType}
                </span>
                <span className="text-xs text-muted-foreground font-normal shrink-0">
                  • {subject.chapters.length} {subject.chapters.length === 1 ? "Chapter" : "Chapters"}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold text-foreground shrink-0">
                  {progress}% Completed
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
