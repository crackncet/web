"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, AlertCircle, ChevronDown, ChevronRight, Lock, Video, FileText, HelpCircle, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentHeader } from "../../../../layout";
import { useStudentCourseDetailQuery } from "../../_queries/course-detail.queries";
import { Topic } from "../../_api/course-detail.api";

export default function StudentSubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const courseSubjectId = params.courseSubjectId as string;

  const { data: response, isLoading, isError, error } = useStudentCourseDetailQuery(courseId);
  const syllabus = response?.data;

  // Find the current subject
  const subject = syllabus?.subjects.find(
    (sub) => sub.courseSubjectId === courseSubjectId
  );

  // Store expanded chapter IDs in state
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Expand the first chapter by default when subject loaded
  useEffect(() => {
    if (subject?.chapters && subject.chapters.length > 0) {
      setExpandedChapters({ [subject.chapters[0].chapterId]: true });
    }
  }, [subject]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const isLocked = (topic: Topic) => {
    if (!topic.scheduledUnlockAt) return false;
    return new Date(topic.scheduledUnlockAt) > new Date();
  };

  const handleTopicClick = (topicId: string) => {
    router.push(
      `/dashboard/student/my-courses/${courseId}/subjects/${courseSubjectId}/topics/${topicId}`
    );
  };

  return (
    <>
      <StudentHeader>
        <div className="flex items-center gap-3 w-full">
          <Link href={`/dashboard/student/my-courses/${courseId}`}>
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
              <span>Course Syllabus</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/90">{syllabus?.course.title || "Course"}</span>
            </div>
            <h1 className="text-xs md:text-sm font-bold tracking-tight text-foreground select-none mt-0.5 line-clamp-1">
              {subject?.subjectName || "Subject Details"}
            </h1>
          </div>
        </div>
      </StudentHeader>

      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <Skeleton className="h-10 w-48 rounded bg-muted/60" />
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full rounded-xl bg-muted/60" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
            <h3 className="text-base font-semibold text-foreground">Failed to Load Subject Syllabus</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              {error instanceof Error ? error.message : "Subject syllabus data could not be retrieved."}
            </p>
            <Link href={`/dashboard/student/my-courses/${courseId}`} className="mt-4">
              <Button variant="outline" size="sm" className="min-h-[44px]">
                Back to Course
              </Button>
            </Link>
          </div>
        )}

        {/* Success Content */}
        {!isLoading && !isError && subject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground">
                {subject.subjectName} Chapters
              </h2>
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {subject.chapters.length} chapters
              </span>
            </div>

            {subject.chapters.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <h4 className="font-semibold text-sm text-foreground">No Chapters Found</h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  There are no chapters uploaded in this subject.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {subject.chapters.map((chapter) => {
                  const isExpanded = !!expandedChapters[chapter.chapterId];
                  return (
                    <div
                      key={chapter.chapterId}
                      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                    >
                      {/* Chapter Header Accordion Trigger */}
                      <button
                        onClick={() => toggleChapter(chapter.chapterId)}
                        className="flex w-full items-center justify-between p-4 text-left font-semibold text-sm md:text-base text-foreground hover:bg-muted/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[48px]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] md:text-xs font-medium text-primary">
                            {chapter.serialNumber}
                          </span>
                          <span className="line-clamp-1">{chapter.name}</span>
                        </div>
                        <div className="shrink-0 text-muted-foreground">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </button>

                      {/* Topics inside the chapter */}
                      {isExpanded && (
                        <div className="border-t border-border bg-muted/10 divide-y divide-border">
                          {(() => {
                            const hasChapterMaterials = chapter.notesAssetId || chapter.chapterPracticeBankId;
                            const displayTopics = hasChapterMaterials
                              ? [
                                  {
                                    topicId: `chapter-overview-${chapter.chapterId}`,
                                    chapterId: chapter.chapterId,
                                    serialNumber: 0,
                                    name: `Chapter Overview & Notes`,
                                    videoLectureId: null,
                                    liveLectureId: null,
                                    notesAssetId: chapter.notesAssetId,
                                    dppBankId: chapter.chapterPracticeBankId,
                                    scheduledUnlockAt: null,
                                  },
                                  ...chapter.topics,
                                ]
                              : chapter.topics;

                            if (displayTopics.length === 0) {
                              return (
                                <div className="p-4 text-center text-xs text-muted-foreground">
                                  No topics in this chapter yet.
                                </div>
                              );
                            }

                            return displayTopics.map((topic) => {
                              const locked = isLocked(topic);
                              return (
                                <button
                                  key={topic.topicId}
                                  disabled={locked}
                                  onClick={() => handleTopicClick(topic.topicId)}
                                  className={`flex w-full items-center justify-between p-3.5 pl-6 text-left transition-colors focus:outline-none min-h-[44px] ${
                                    locked
                                      ? "cursor-not-allowed opacity-60 bg-muted/5"
                                      : "hover:bg-primary/5 active:bg-primary/10"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 w-full pr-4">
                                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                                      {chapter.serialNumber}.{topic.serialNumber}
                                    </span>
                                    <span className="text-xs md:text-sm font-medium text-foreground line-clamp-1">
                                      {topic.name}
                                    </span>
                                  </div>

                                  {/* Right Section: Material Icons */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    {locked ? (
                                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                    ) : (
                                      <>
                                        {topic.videoLectureId && (
                                          <Video className="h-3.5 w-3.5 text-primary" />
                                        )}
                                        {topic.notesAssetId && (
                                          <FileText className="h-3.5 w-3.5 text-indigo-500" />
                                        )}
                                        {topic.dppBankId && (
                                          <HelpCircle className="h-3.5 w-3.5 text-emerald-500" />
                                        )}
                                        {topic.liveLectureId && (
                                          <Laptop className="h-3.5 w-3.5 text-amber-500" />
                                        )}
                                      </>
                                    )}
                                  </div>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
