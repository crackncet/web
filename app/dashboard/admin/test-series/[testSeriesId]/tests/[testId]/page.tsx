"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useTestSeriesDetailQuery,
  useTestSeriesTestsQuery,
  useAdminTestSubjectsQuery,
} from "../../../_queries/test-series.queries";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  FileSpreadsheet,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminTestDetailPage() {
  const params = useParams();
  const testSeriesId = params.testSeriesId as string;
  const testId = params.testId as string;

  const { data: detailResponse, isLoading: isDetailLoading } = useTestSeriesDetailQuery(testSeriesId);
  const { data: testsResponse, isLoading: isTestsLoading } = useTestSeriesTestsQuery(testSeriesId, { limit: 100 });
  const { data: subjectsResponse, isLoading: isSubjectsLoading } = useAdminTestSubjectsQuery(testSeriesId, testId);

  const detail = detailResponse?.data;
  const testInfo = testsResponse?.data?.find((t) => t.id === testId);
  const testSubjects = subjectsResponse?.data || [];

  const isLoading = isDetailLoading || isTestsLoading || isSubjectsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <Skeleton className="h-8 w-1/4 rounded-lg bg-muted/60" />
        <Skeleton className="h-36 w-full rounded-2xl bg-muted/60" />
        <Skeleton className="h-64 w-full rounded-2xl bg-muted/60" />
      </div>
    );
  }

  if (!detail || !testInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 select-none">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Test Not Found</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-2 leading-relaxed">
          The requested test was not found, or you do not have permission to view it.
        </p>
        <Link href={`/dashboard/admin/test-series/${testSeriesId}`} className="mt-5">
          <Button variant="outline" className="text-xs font-bold gap-1 rounded-xl cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back to Test Series
          </Button>
        </Link>
      </div>
    );
  }

  // Format scheduled date
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "Not Scheduled";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format duration
  const formatDuration = (mins: number | null) => {
    if (!mins) return "—";
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (remainingMins === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${remainingMins} mins`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <AdminHeader>
        <div className="flex items-center gap-3 w-full animate-in slide-in-from-left-2 duration-200">
          <Link href={`/dashboard/admin/test-series/${testSeriesId}`}>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
              <span>{detail.name}</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/95">TESTS</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-foreground select-none mt-0.5">
              Test Curriculums & Question Papers
            </h1>
          </div>
        </div>
      </AdminHeader>

      {/* Test Meta Card */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 select-none">
        <div className="space-y-3">
          <h2 className="text-lg font-black text-slate-855 dark:text-slate-100 tracking-tight leading-snug">
            {testInfo.name}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            {testInfo.description || "No description provided for this test schedule."}
          </p>

          <div className="flex flex-wrap gap-y-3 gap-x-6 text-[11px] text-muted-foreground pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
              {formatDateTime(testInfo.scheduledAt)}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock className="h-4 w-4 text-primary/70 shrink-0" />
              Duration: {formatDuration(testInfo.durationMinutes)}
            </span>
          </div>
        </div>
      </Card>

      {/* Subjects & Question Papers Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-855 dark:text-slate-200 tracking-wider uppercase select-none flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-primary" />
          Linked Subjects
        </h3>

        {testSubjects.length === 0 ? (
          <Card className="border border-dashed border-border/80 bg-muted/5 py-12 flex flex-col items-center justify-center text-center p-6 select-none rounded-2xl">
            <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/80">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-foreground">No Subjects Configured</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
              No subjects have been linked to this test series yet.
            </p>
          </Card>
        ) : (
          <div className="border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs animate-in fade-in duration-300">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-955/20 hover:bg-slate-50/50 dark:hover:bg-slate-955/20 border-b border-slate-205 dark:border-slate-800">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">
                    Stream Name
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">
                    Subject Name
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">
                    Assigned Faculty
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">
                    Question Paper Title
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testSubjects.map((sub) => {
                  // Find corresponding stream and teacher from detail.streams
                  let streamName = "—";
                  let teacherName = "—";

                  for (const str of detail.streams) {
                    const matchedSub = str.subjects.find((s) => s.subjectId === sub.subjectId);
                    if (matchedSub) {
                      streamName = str.streamName;
                      if (matchedSub.teacher) {
                        teacherName = matchedSub.teacher.fullName;
                      }
                      break;
                    }
                  }

                  return (
                    <TableRow
                      key={sub.subjectId}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/30 dark:hover:bg-slate-800/20"
                    >
                      <TableCell className="align-middle px-4 py-3.5 text-xs text-slate-500 font-medium">
                        {streamName}
                      </TableCell>
                      <TableCell className="align-middle px-4 py-3.5 text-xs font-bold text-slate-850 dark:text-slate-200">
                        {sub.subjectName}
                      </TableCell>
                      <TableCell className="align-middle px-4 py-3.5 text-xs text-slate-700 dark:text-slate-350 font-medium">
                        {teacherName}
                      </TableCell>
                      <TableCell className="align-middle px-4 py-3.5">
                        {sub.questionBank ? (
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-xs">
                              {sub.questionBank.title}
                            </span>
                            
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-semibold bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            No paper attached
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="align-middle px-4 py-3.5 text-right">
                        {sub.questionBank && (
                          <Link href={`/dashboard/member/question-banks/${sub.questionBank.id}/view`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs font-bold h-8 w-8 p-0 rounded-lg cursor-pointer border-slate-200 dark:border-slate-800 select-none"
                              title="View Question Bank"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-500 hover:text-primary" />
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
