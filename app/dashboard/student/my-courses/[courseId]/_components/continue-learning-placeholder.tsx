"use client";

import { Play, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ContinueLearningPlaceholderProps {
  courseId: string;
  defaultSubjectId?: string;
  defaultTopicId?: string;
}

export function ContinueLearningPlaceholder({
  courseId,
  defaultSubjectId,
  defaultTopicId,
}: ContinueLearningPlaceholderProps) {
  // Mock continue learning items
  const recentTopics = [
    {
      topicName: "Relations and Functions",
      subjectName: "Mathematics",
      chapterName: "Relations & Functions",
      progress: 60,
      subjectId: defaultSubjectId || "subject-1",
      topicId: defaultTopicId || "topic-1",
    },
    {
      topicName: "Newton's Laws of Motion",
      subjectName: "Physics",
      chapterName: "Mechanics",
      progress: 30,
      subjectId: defaultSubjectId || "subject-2",
      topicId: defaultTopicId || "topic-2",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
        <Clock className="h-4 w-4 text-primary" />
        <span>Continue Learning</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {recentTopics.map((topic, idx) => {
          // If actual IDs aren't provided, we can link safely using hashes or custom routes
          const href =
            defaultSubjectId && defaultTopicId
              ? `/dashboard/student/my-courses/${courseId}/subjects/${topic.subjectId}/topics/${topic.topicId}`
              : `#`;

          return (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider">
                    {topic.subjectName}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                    {topic.topicName}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    Chapter: {topic.chapterName}
                  </p>
                </div>

                <Link href={href}>
                  <Button
                    size="sm"
                    className="h-8 w-8 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground shrink-0 shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </Button>
                </Link>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                  <span>{topic.progress}% Completed</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${topic.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
