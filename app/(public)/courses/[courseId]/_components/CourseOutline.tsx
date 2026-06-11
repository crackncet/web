import React, { useState, useEffect } from "react";
import { Award, BookOpen, ChevronDown, ChevronRight, FileText, Compass } from "lucide-react";
import { usePublicCourseOutlineQuery } from "../_queries/courseDetail.queries";
import { cn } from "@/lib/utils";

interface CourseOutlineProps {
  courseId: string;
}

export function CourseOutline({ courseId }: CourseOutlineProps) {
  const { data: outline, isLoading, error } = usePublicCourseOutlineQuery(courseId);

  // Expanded streams state
  const [expandedStreams, setExpandedStreams] = useState<Record<string, boolean>>({});
  // Selected subject state
  const [selectedSubj, setSelectedSubj] = useState<{ streamName: string; subjectName: string } | null>(null);

  // Toggle stream expansion
  const toggleStream = (streamName: string) => {
    setExpandedStreams((prev) => ({
      ...prev,
      [streamName]: !prev[streamName],
    }));
  };

  // Initialize state when data is loaded
  useEffect(() => {
    if (outline && outline.length > 0) {
      // Expand all streams by default
      const initialExpanded: Record<string, boolean> = {};
      outline.forEach((stream) => {
        initialExpanded[stream.streamName] = true;
      });
      setExpandedStreams(initialExpanded);

      // Select first subject by default
      const firstStream = outline[0];
      if (firstStream.subjects && firstStream.subjects.length > 0) {
        setSelectedSubj({
          streamName: firstStream.streamName,
          subjectName: firstStream.subjects[0].subjectName,
        });
      }
    }
  }, [outline]);

  // Find the selected subject's chapters
  const activeSubjectData = outline
    ?.find((s) => s.streamName === selectedSubj?.streamName)
    ?.subjects.find((sub) => sub.subjectName === selectedSubj?.subjectName);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-55 flex items-center gap-2">
          <Award className="h-5 w-5 text-violet-600" />
          Detailed Syllabus & Chapters
        </h3>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          Subject-wise progression from fundamentals to advanced concepts.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-pulse">
          <div className="md:col-span-4 space-y-4">
            <div className="h-8 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
          <div className="md:col-span-8 space-y-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
        </div>
      ) : error || !outline || outline.length === 0 ? (
        <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400 bg-slate-50/30 dark:bg-slate-950/20">
          <BookOpen className="h-8 w-8 text-slate-350 mb-2" />
          <p className="text-xs font-semibold">No syllabus outline available for this course yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Streams & Subjects (md:col-span-4) */}
          <div className="md:col-span-4 space-y-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-6 md:pb-0 md:pr-6">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Streams & Subjects
            </span>
            
            <div className="space-y-3">
              {outline.map((stream) => {
                const isExpanded = !!expandedStreams[stream.streamName];
                return (
                  <div key={stream.streamName} className="space-y-1">
                    {/* Stream Title Header */}
                    <button
                      onClick={() => toggleStream(stream.streamName)}
                      className="w-full flex items-center justify-between py-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="truncate">{stream.streamName}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {/* Stream Subjects List */}
                    {isExpanded && (
                      <div className="pl-3 space-y-1 border-l border-slate-150 dark:border-slate-800/80 ml-1.5 mt-1">
                        {stream.subjects.map((subj) => {
                          const isActive =
                            selectedSubj?.streamName === stream.streamName &&
                            selectedSubj?.subjectName === subj.subjectName;

                          return (
                            <button
                              key={subj.subjectName}
                              onClick={() =>
                                setSelectedSubj({
                                  streamName: stream.streamName,
                                  subjectName: subj.subjectName,
                                })
                              }
                              className={cn(
                                "w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all block cursor-pointer truncate",
                                isActive
                                  ? "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400"
                                  : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                              )}
                            >
                              {subj.subjectName}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chapters & Topics (md:col-span-8) */}
          <div className="md:col-span-8 space-y-6">
            {activeSubjectData ? (
              <div className="space-y-6">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 block">
                    Syllabus
                  </span>
                  <h4 className="text-sm font-black text-slate-850 dark:text-slate-100 mt-0.5">
                    {selectedSubj?.subjectName} chapters
                  </h4>
                </div>

                {!activeSubjectData.chapters || activeSubjectData.chapters.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
                    <FileText className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-semibold">No chapters available in this subject.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeSubjectData.chapters.map((chapter, chapIdx) => (
                      <div key={chapIdx} className="space-y-3">
                        {/* Chapter Title */}
                        <h5 className="text-xs font-extrabold text-violet-755 dark:text-violet-400 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" />
                          Chapter {chapIdx + 1}: {chapter.chapterName}
                        </h5>

                        {/* Topics List */}
                        {!chapter.topics || chapter.topics.length === 0 ? (
                          <p className="pl-3.5 text-[11px] text-slate-450 font-semibold italic">
                            No topics specified yet.
                          </p>
                        ) : (
                          <div className="pl-3.5 space-y-1.5 border-l border-slate-100 dark:border-slate-850 ml-0.75">
                            {chapter.topics.map((topic, topIdx) => (
                              <div
                                key={topIdx}
                                className="text-xs text-slate-600 dark:text-slate-350 flex items-center gap-2"
                              >
                                <span className="text-slate-400 font-bold shrink-0">{topIdx + 1}.</span>
                                <span className="font-semibold truncate">{topic.topicName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                <Compass className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold">Please select a subject to view its syllabus.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
