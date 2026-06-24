"use client";

import React, { use } from "react";
import {
  useDoubtDetailQuery,
  useAddResponseMutation,
  useResolveDoubtMutation,
} from "../_queries/doubts.queries";
import { DoubtDetailCard } from "../_components/doubt-detail-card";
import { DoubtResponseThread } from "../_components/doubt-response-thread";
import { DoubtReplyForm } from "../_components/doubt-reply-form";
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

export default function StudentDoubtDetailPage({ params }: PageProps) {
  const { doubtId } = use(params);

  const { data, isLoading } = useDoubtDetailQuery(doubtId);
  const addResponseMutation = useAddResponseMutation(doubtId);
  const resolveDoubtMutation = useResolveDoubtMutation(doubtId);

  const handlePostResponse = (payload: { content: string; imageUrl: string | null }) => {
    addResponseMutation.mutate(payload);
  };

  const handleResolve = () => {
    resolveDoubtMutation.mutate();
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
          This doubt may have been deleted, or you do not have permission to view it.
        </p>
        <Link href="/dashboard/student/doubts" className="mt-4">
          <Button variant="outline" size="sm" className="rounded-lg text-xs">
            Back to Doubt Desk
          </Button>
        </Link>
      </div>
    );
  }

  const { doubt, replies } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 animate-in fade-in duration-300">
      {/* Upper navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 select-none">
        <Link
          href="/dashboard/student/doubts"
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Doubt Desk</span>
        </Link>
        {doubt.status !== "RESOLVED" && (
          <Button
            onClick={handleResolve}
            disabled={resolveDoubtMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-bold rounded-xl text-xs px-4 cursor-pointer"
          >
            {resolveDoubtMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
            <span>Mark as Solved</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Chat window thread */}
        <div className="lg:col-span-2 space-y-5">
          <DoubtDetailCard doubt={doubt} />

          <DoubtResponseThread replies={replies} />

          {/* Form / Status Notice */}
          {doubt.status !== "RESOLVED" ? (
            <DoubtReplyForm
              onSubmit={handlePostResponse}
              isPending={addResponseMutation.isPending}
            />
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-xs flex items-start gap-2.5 select-none">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">This doubt has been marked as solved</p>
                <p className="mt-0.5 opacity-90">
                  If you have further follow-up questions, sending a message in the input above will automatically reopen this doubt query.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Information Metadata */}
        <div className="lg:col-span-1 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4 shadow-2xs select-none">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2.5">
            Metadata Context
          </div>

          <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-350">
            {/* Subject info */}
            {doubt.subject && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Subject
                </span>
                <span className="font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="truncate">{doubt.subject.name}</span>
                </span>
              </div>
            )}

            {/* Created time */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Submitted
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

            {/* Assigned Teacher */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Assigned Instructor
              </span>
              <span className="font-medium flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">
                  {doubt.assignedTeacher?.fullName || "Unassigned"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
