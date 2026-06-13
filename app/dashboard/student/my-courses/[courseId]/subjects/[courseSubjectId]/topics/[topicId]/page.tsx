"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Video,
  FileText,
  HelpCircle,
  Laptop,
  AlertCircle,
  Loader2,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentHeader } from "../../../../../../layout";
import { useStudentCourseDetailQuery } from "../../../../_queries/course-detail.queries";
import { useSharedAssetDetailQuery } from "@/app/dashboard/member/media/_queries/media.queries";
import { VideoPlayer } from "@/components/video/VideoPlayer";

export default function StudentTopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const courseSubjectId = params.courseSubjectId as string;
  const topicId = params.topicId as string;

  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [activeAssetType, setActiveAssetType] = useState<"VIDEO" | "NOTE" | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  // Monitor device orientation for landscape lock recommendation
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  // Fetch classroom course/syllabus hierarchy
  const { data: response, isLoading: isSyllabusLoading, isError: isSyllabusError } =
    useStudentCourseDetailQuery(courseId);
  const syllabus = response?.data;

  // Locate the topic inside syllabus subjects & chapters
  const subject = syllabus?.subjects.find((sub) => sub.courseSubjectId === courseSubjectId);
  let topic: any = null;
  let nextTopic: any = null;

  if (subject) {
    if (topicId.startsWith("chapter-overview-")) {
      const targetChapterId = topicId.replace("chapter-overview-", "");
      const chapterIndex = subject.chapters.findIndex((c) => c.chapterId === targetChapterId);
      if (chapterIndex !== -1) {
        const chapter = subject.chapters[chapterIndex];
        topic = {
          topicId: `chapter-overview-${chapter.chapterId}`,
          chapterId: chapter.chapterId,
          serialNumber: 0,
          name: `${chapter.name} Overview & Notes`,
          videoLectureId: null,
          liveLectureId: null,
          notesAssetId: chapter.notesAssetId,
          dppBankId: chapter.chapterPracticeBankId,
          scheduledUnlockAt: null,
        };

        // Next topic is the first topic of this chapter if it exists
        if (chapter.topics.length > 0) {
          nextTopic = chapter.topics[0];
        } else if (chapterIndex + 1 < subject.chapters.length) {
          // fallback to next chapter
          const nextChapter = subject.chapters[chapterIndex + 1];
          const hasNextVirtual = nextChapter.notesAssetId || nextChapter.chapterPracticeBankId;
          if (hasNextVirtual) {
            nextTopic = {
              topicId: `chapter-overview-${nextChapter.chapterId}`,
              name: `${nextChapter.name} Overview & Notes`,
            };
          } else if (nextChapter.topics.length > 0) {
            nextTopic = nextChapter.topics[0];
          }
        }
      }
    } else {
      // Find normal topic
      for (let i = 0; i < subject.chapters.length; i++) {
        const chapter = subject.chapters[i];
        const tIndex = chapter.topics.findIndex((t) => t.topicId === topicId);
        if (tIndex !== -1) {
          topic = chapter.topics[tIndex];

          // Retrieve next topic link if available
          if (tIndex + 1 < chapter.topics.length) {
            nextTopic = chapter.topics[tIndex + 1];
          } else if (i + 1 < subject.chapters.length) {
            const nextChapter = subject.chapters[i + 1];
            const hasNextVirtual = nextChapter.notesAssetId || nextChapter.chapterPracticeBankId;
            if (hasNextVirtual) {
              nextTopic = {
                topicId: `chapter-overview-${nextChapter.chapterId}`,
                name: `${nextChapter.name} Overview & Notes`,
              };
            } else if (nextChapter.topics.length > 0) {
              nextTopic = nextChapter.topics[0];
            }
          }
          break;
        }
      }
    }
  }

  // Set default active asset when topic details load
  useEffect(() => {
    if (topic && !activeAssetId) {
      if (topic.videoLectureId) {
        setActiveAssetId(topic.videoLectureId);
        setActiveAssetType("VIDEO");
      } else if (topic.notesAssetId) {
        setActiveAssetId(topic.notesAssetId);
        setActiveAssetType("NOTE");
      }
    }
  }, [topic, activeAssetId]);

  // Fetch active shared media asset details (presigned URL)
  const { data: assetResponse, isLoading: isAssetLoading, error: assetError } =
    useSharedAssetDetailQuery(activeAssetId || "");
  const asset = assetResponse?.data;

  // Construct absolute secure media URL
  const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const streamUrl =
    asset && asset.url
      ? asset.url.startsWith("http")
        ? asset.url
        : `${baseApiUrl}${asset.url}`
      : "";

  const handleAssetSelect = (assetId: string, type: "VIDEO" | "NOTE") => {
    setActiveAssetId(assetId);
    setActiveAssetType(type);
  };

  if (isSyllabusLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <Skeleton className="h-8 w-1/4 rounded bg-muted/60" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-96 col-span-8 rounded-2xl bg-muted/60" />
          <Skeleton className="h-96 col-span-4 rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  if (isSyllabusError || !topic) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 border border-border rounded-2xl bg-card shadow-sm">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h3 className="text-base font-bold text-foreground">Topic Not Accessible</h3>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          This topic is locked or you do not have permission to view it.
        </p>
        <Button size="sm" onClick={() => router.back()} className="min-h-[44px]">
          Go Back
        </Button>
      </div>
    );
  }

  const hasVideo = !!topic.videoLectureId;
  const hasNotes = !!topic.notesAssetId;
  const hasDpp = !!topic.dppBankId;
  const hasLive = !!topic.liveLectureId;

  return (
    <>
      <StudentHeader>
        <div className="flex items-center gap-3 w-full">
          <Link href={`/dashboard/student/my-courses/${courseId}/subjects/${courseSubjectId}`}>
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
              <span>{subject?.subjectName}</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/90">Topic View</span>
            </div>
            <h1 className="text-xs md:text-sm font-bold tracking-tight text-foreground select-none mt-0.5 line-clamp-1">
              {topic.name}
            </h1>
          </div>
        </div>
      </StudentHeader>

      {/* Landscape Rotation Recommendation Overlay for Mobile Viewports */}
      {isPortrait && activeAssetType && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center text-xs text-primary font-semibold flex items-center justify-center gap-2 mb-4 animate-in fade-in select-none">
          <Maximize2 className="h-4 w-4 shrink-0" />
          <span>Rotate your phone to landscape mode for a larger viewing experience.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Media Viewer Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video lg:h-[500px] w-full bg-slate-950 rounded-2xl overflow-hidden shadow-sm border border-border flex items-center justify-center">
            {isAssetLoading ? (
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-[10px] font-medium tracking-wide">Loading asset stream...</span>
              </div>
            ) : assetError || !activeAssetId ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-6 text-center select-none">
                <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
                <span className="text-xs font-semibold">Select an asset from the sidebar to view</span>
              </div>
            ) : activeAssetType === "NOTE" ? (
              <div className="w-full h-full relative flex flex-col bg-slate-900">
                <iframe
                  src={`${streamUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-0"
                  title={asset?.name || "Study Document"}
                />
                <div className="absolute bottom-4 right-4 z-10">
                  <a href={streamUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Fullscreen Notes
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <VideoPlayer
                assetId={activeAssetId}
                streamUrl={streamUrl}
                showWatermark={true}
                className="w-full h-full"
              />
            )}
          </div>

          {/* Topic description & details */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-2">
            <h2 className="text-base font-bold text-foreground">{topic.name}</h2>
            <p className="text-xs text-muted-foreground">
              Study the resources below to complete this topic module. Track your progress with the
              mark-complete status.
            </p>
          </div>
        </div>

        {/* Sidebar Controls & Assets Menu */}
        <div className="lg:col-span-4 space-y-4">
          {/* List of Topic Study Assets */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border select-none">
              Topic Resources
            </h3>

            <div className="flex flex-col gap-2">
              {/* Video Button */}
              {hasVideo && (
                <Button
                  onClick={() => handleAssetSelect(topic.videoLectureId, "VIDEO")}
                  variant={activeAssetType === "VIDEO" ? "default" : "outline"}
                  className="w-full justify-start gap-3 text-xs font-semibold min-h-[44px] px-3.5"
                >
                  <Video className="h-4 w-4 shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span>Watch Video Lecture</span>
                  </div>
                </Button>
              )}

              {/* Revision Notes Button */}
              {hasNotes && (
                <Button
                  onClick={() => handleAssetSelect(topic.notesAssetId, "NOTE")}
                  variant={activeAssetType === "NOTE" ? "default" : "outline"}
                  className="w-full justify-start gap-3 text-xs font-semibold min-h-[44px] px-3.5"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span>Read Study Notes</span>
                  </div>
                </Button>
              )}

              {/* DPP Practice Section */}
              {hasDpp && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 text-xs font-semibold min-h-[44px] px-3.5 border-border hover:bg-emerald-500/5 hover:text-emerald-600 hover:border-emerald-500/20"
                >
                  <HelpCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Practice DPP Questions</span>
                </Button>
              )}

              {/* Live Lecture Section */}
              {hasLive && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 text-xs font-semibold min-h-[44px] px-3.5 border-border hover:bg-amber-500/5 hover:text-amber-600 hover:border-amber-500/20"
                >
                  <Laptop className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Join Live Lecture</span>
                </Button>
              )}

              {!hasVideo && !hasNotes && !hasDpp && !hasLive && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No materials are uploaded for this topic.
                </p>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          {nextTopic && (
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block select-none mb-2">
                Up Next
              </span>
              <button
                onClick={() => {
                  setActiveAssetId(null);
                  setActiveAssetType(null);
                  router.push(
                    `/dashboard/student/my-courses/${courseId}/subjects/${courseSubjectId}/topics/${nextTopic.topicId}`
                  );
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40 hover:bg-muted transition-colors text-left focus:outline-none min-h-[44px]"
              >
                <div className="space-y-0.5 max-w-[85%]">
                  <h4 className="text-xs font-bold text-foreground line-clamp-1">
                    {nextTopic.name}
                  </h4>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
