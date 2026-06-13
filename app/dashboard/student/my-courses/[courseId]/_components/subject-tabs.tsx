"use client";

import { cn } from "@/lib/utils";
import { SubjectSyllabus } from "../_api/course-detail.api";

interface SubjectTabsProps {
  subjects: SubjectSyllabus[];
  activeSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
}

export function SubjectTabs({
  subjects,
  activeSubjectId,
  onSelectSubject,
}: SubjectTabsProps) {
  return (
    <div
      className="w-full overflow-x-auto border-b border-border bg-background py-1.5 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="flex gap-2 min-w-max">
        {subjects.map((subject) => {
          const isActive = subject.courseSubjectId === activeSubjectId;
          return (
            <button
              key={subject.courseSubjectId}
              onClick={() => onSelectSubject(subject.courseSubjectId)}
              className={cn(
                "inline-flex items-center justify-center rounded-full px-4 py-2 text-xs md:text-sm font-medium transition-all duration-200 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary/40",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {subject.subjectName}
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold shrink-0",
                  isActive
                    ? "bg-primary-foreground/25 text-primary-foreground"
                    : "bg-muted-foreground/15 text-muted-foreground"
                )}
              >
                {subject.chapters.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
