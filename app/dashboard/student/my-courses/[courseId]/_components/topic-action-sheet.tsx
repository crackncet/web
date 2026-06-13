"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Video, FileText, HelpCircle, Laptop } from "lucide-react";
import { Topic } from "../_api/course-detail.api";

interface TopicActionSheetProps {
  courseId: string;
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TopicActionSheet({
  courseId,
  topic,
  isOpen,
  onClose,
}: TopicActionSheetProps) {
  if (!topic) return null;

  const hasVideo = !!topic.videoLectureId;
  const hasNotes = !!topic.notesAssetId;
  const hasDpp = !!topic.dppBankId;
  const hasLive = !!topic.liveLectureId;
  const hasAnyMaterial = hasVideo || hasNotes || hasDpp || hasLive;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 
        On mobile: slides from bottom. On desktop: slides from right.
        Our components/ui/sheet.tsx handles standard side="right", 
        but we can set side="bottom" for mobile and sm:side="right" if desired, 
        or we can just keep the standard side="bottom" as a mobile-first bottom sheet!
      */}
      <SheetContent side="bottom" className="rounded-t-2xl sm:rounded-t-none sm:rounded-l-2xl sm:max-w-md max-h-[85vh] p-6">
        <SheetHeader className="text-left p-0 pb-4 border-b border-border">
          <SheetTitle className="text-base font-bold text-foreground line-clamp-1">
            {topic.name}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Select an option below to start studying this topic.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 flex flex-col gap-3">
          {/* Locked State Check */}
          {topic.scheduledUnlockAt && new Date(topic.scheduledUnlockAt) > new Date() ? (
            <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 text-center text-sm text-warning-foreground">
              This topic is locked. It will unlock on{" "}
              {new Date(topic.scheduledUnlockAt).toLocaleDateString()}
            </div>
          ) : !hasAnyMaterial ? (
            <div className="rounded-xl border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No study materials have been uploaded for this topic yet.
            </div>
          ) : (
            <>
              {/* Video Lecture Link */}
              {hasVideo && (
                <Link
                  href={`/dashboard/student/my-courses/${courseId}/topics/${topic.topicId}/video`}
                  className="w-full"
                  onClick={onClose}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 text-sm font-medium border-border hover:bg-primary/5 hover:text-primary hover:border-primary/20 min-h-[48px] px-4"
                  >
                    <Video className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex flex-col items-start text-left">
                      <span>Video Lecture</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Watch recorded concept class
                      </span>
                    </div>
                  </Button>
                </Link>
              )}

              {/* Revision Notes Link */}
              {hasNotes && (
                <Link
                  href={`/dashboard/student/my-courses/${courseId}/topics/${topic.topicId}/notes`}
                  className="w-full"
                  onClick={onClose}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 text-sm font-medium border-border hover:bg-primary/5 hover:text-primary hover:border-primary/20 min-h-[48px] px-4"
                  >
                    <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                    <div className="flex flex-col items-start text-left">
                      <span>Revision Notes</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Read chapter summaries & formulas
                      </span>
                    </div>
                  </Button>
                </Link>
              )}

              {/* DPP Link */}
              {hasDpp && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 text-sm font-medium border-border hover:bg-primary/5 hover:text-primary hover:border-primary/20 min-h-[48px] px-4"
                  onClick={() => {
                    // Navigate to DPP or show a toast
                    onClose();
                  }}
                >
                  <HelpCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span>Daily Practice Problems (DPP)</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Solve daily practice question bank
                    </span>
                  </div>
                </Button>
              )}

              {/* Live Lecture Link */}
              {hasLive && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 text-sm font-medium border-border hover:bg-primary/5 hover:text-primary hover:border-primary/20 min-h-[48px] px-4"
                  onClick={() => {
                    // Navigate to Live Lecture
                    onClose();
                  }}
                >
                  <Laptop className="h-5 w-5 text-amber-500 shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span>Live Lecture</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Join online interactive class
                    </span>
                  </div>
                </Button>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
