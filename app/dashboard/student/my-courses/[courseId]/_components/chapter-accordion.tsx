"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Lock, Video, FileText, HelpCircle, Laptop } from "lucide-react";
import { Chapter, Topic } from "../_api/course-detail.api";

interface ChapterAccordionProps {
  chapters: Chapter[];
  onSelectTopic: (topic: Topic) => void;
}

export function ChapterAccordion({ chapters, onSelectTopic }: ChapterAccordionProps) {
  // Store expanded chapter IDs in state. Expand the first chapter by default.
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    if (chapters.length > 0) {
      return { [chapters[0].chapterId]: true };
    }
    return {};
  });

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

  return (
    <div className="space-y-3">
      {chapters.map((chapter) => {
        const isExpanded = !!expandedChapters[chapter.chapterId];
        return (
          <div
            key={chapter.chapterId}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            {/* Chapter Header */}
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

            {/* Topics List */}
            {isExpanded && (
              <div className="border-t border-border bg-muted/10 divide-y divide-border">
                {chapter.topics.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No topics in this chapter yet.
                  </div>
                ) : (
                  chapter.topics.map((topic) => {
                    const locked = isLocked(topic);
                    return (
                      <button
                        key={topic.topicId}
                        disabled={locked}
                        onClick={() => onSelectTopic(topic)}
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

                        {/* Right Section: Material Badges or Lock */}
                        <div className="flex items-center gap-2 shrink-0">
                          {locked ? (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <>
                              {/* Display miniature badges for materials */}
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
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
