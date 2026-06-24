"use client";

import React, { use } from "react";
import { MemberHeader } from "../../layout";
import {
  useTeacherDoubtDetailQuery,
  useTeacherAddResponseMutation,
  useTeacherResolveDoubtMutation,
  useClaimDoubtMutation,
} from "../_queries/doubts.queries";
import { DoubtDetailCard } from "@/app/dashboard/student/doubts/_components/doubt-detail-card";
import { DoubtResponseThread } from "@/app/dashboard/student/doubts/_components/doubt-response-thread";
import { DoubtReplyForm } from "@/app/dashboard/student/doubts/_components/doubt-reply-form";
import {
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ doubtId: string }>;
}

export default function MemberDoubtDetailPage({ params }: PageProps) {
  const { doubtId } = use(params);

  const { data, isLoading } = useTeacherDoubtDetailQuery(doubtId);
  const addResponseMutation = useTeacherAddResponseMutation(doubtId);
  const resolveDoubtMutation = useTeacherResolveDoubtMutation(doubtId);
  const claimMutation = useClaimDoubtMutation();

  const handlePostResponse = (payload: { content: string; imageUrl: string | null }) => {
    addResponseMutation.mutate(payload);
  };

  const handleResolve = () => {
    resolveDoubtMutation.mutate();
  };

  const handleClaim = () => {
    claimMutation.mutate(doubtId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-xs mt-2 font-medium">
          Retrieving discussion history...
        </p>
      </div>
    );
  }

  if (!data?.doubt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center max-w-sm mx-auto">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
        <h3 className="font-bold text-foreground text-sm">Doubt Query Not Found</h3>
        <p className="text-muted-foreground text-xs mt-1">
          This doubt may have been deleted, or you do not have permission to access it.
        </p>
        <Link href="/dashboard/member/doubts" className="mt-4">
          <Button variant="outline" size="sm" className="rounded-lg text-xs">
            Back to Doubt Queue
          </Button>
        </Link>
      </div>
    );
  }

  const { doubt, replies } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <MemberHeader>
        <div className="flex items-center justify-between w-full select-none">
          <Link
            href="/dashboard/member/doubts"
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Doubt Queue</span>
          </Link>
          <div className="flex gap-2">
            {doubt.status === "UNASSIGNED" && (
              <Button
                onClick={handleClaim}
                disabled={claimMutation.isPending}
                className="bg-primary text-primary-foreground font-bold rounded-xl text-xs px-4"
              >
                {claimMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : null}
                <span>Claim Doubt Query</span>
              </Button>
            )}
            {doubt.status === "CLAIMED" && (
              <Button
                onClick={handleResolve}
                disabled={resolveDoubtMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-bold rounded-xl text-xs px-4"
              >
                {resolveDoubtMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                <span>Mark Resolved</span>
              </Button>
            )}
          </div>
        </div>
      </MemberHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
        {/* Discussion thread */}
        <div className="lg:col-span-2 space-y-5">
          <DoubtDetailCard doubt={doubt} />

          <DoubtResponseThread replies={replies} />

          {/* Reply Form or Status indicator */}
          {doubt.status === "CLAIMED" ? (
            <DoubtReplyForm
              onSubmit={handlePostResponse}
              isPending={addResponseMutation.isPending}
            />
          ) : doubt.status === "UNASSIGNED" ? (
            <div className="bg-amber-500/5 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" />
                <span>Claim Required</span>
              </p>
              <p className="mt-1">
                You must claim this doubt first before you can post replies or solutions. Click the "Claim Doubt Query" button in the header.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-xs flex items-start gap-2.5">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">This doubt has been marked resolved</p>
                <p className="mt-0.5 opacity-90">
                  This query has been marked solved and is archived. No further replies can be sent unless reopened by the student.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar details */}
        <div className="lg:col-span-1 border border-border bg-card rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-2.5">
            Doubt Context
          </div>

          <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-350">
            {/* Student info */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Student Name
              </span>
              <span className="font-bold text-foreground truncate">
                {doubt.student?.fullName || "Student"}
              </span>
              <span className="text-[9px] text-muted-foreground -mt-0.5 truncate">
                {doubt.student?.email}
              </span>
            </div>

            {/* Subject */}
            {doubt.subject && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Subject
                </span>
                <span className="font-bold text-indigo-500 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="truncate">{doubt.subject.name}</span>
                </span>
              </div>
            )}

            {/* Submitted Date */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Submitted At
              </span>
              <span className="font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  {new Date(doubt.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
