"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTestSeriesTestsQuery } from "../../_queries/test-series.queries";
import { TestSeriesDetail } from "../../_api/test-series.api";
import { AddTestsDialog } from "./add-tests-dialog";
import { EditTestDialog } from "./edit-test-dialog";
import {
  FileText,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TestsListSectionProps {
  testSeriesId: string;
  detail: TestSeriesDetail;
}

export function TestsListSection({
  testSeriesId,
  detail,
}: TestsListSectionProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: response, isLoading, isPlaceholderData } = useTestSeriesTestsQuery(
    testSeriesId,
    { page, limit }
  );

  const tests = response?.data || [];
  const meta = response?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  const getTestStatus = (scheduledAtStr: string | null) => {
    if (!scheduledAtStr) return "UNSCHEDULED";
    const scheduledAt = new Date(scheduledAtStr);
    const now = new Date();
    if (scheduledAt > now) return "UPCOMING";
    return "CONDUCTED";
  };

  const formatDuration = (mins: number | null) => {
    if (!mins) return "—";
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (remainingMins === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${remainingMins} mins`;
  };

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

  const startEntry = (meta.page - 1) * meta.limit + 1;
  const endEntry = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between select-none border-b border-slate-150 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 tracking-wider uppercase flex items-center gap-2">
          <ClipboardList className="h-4.5 w-4.5 text-primary" />
          Test Schedules ({meta.total})
        </h3>
        <AddTestsDialog
          testSeriesId={testSeriesId}
          isActive={detail.isActive}
          startDate={detail.startDate}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-14 w-full rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <Card className="border border-dashed border-border/80 bg-muted/5 py-12 flex flex-col items-center justify-center text-center p-6 select-none rounded-2xl">
          <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/80">
            <FileText className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-sm text-foreground">No Tests Created</h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
            There are no tests under this test series yet.
            {!detail.isActive && " Click the button above to add new tests."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-955/20 hover:bg-slate-50/50 dark:hover:bg-slate-955/20 border-b border-slate-205 dark:border-slate-800">
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">
                    Test Name
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">
                    Schedule Date & Time
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">
                    Duration
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4 text-right">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => {
                  const testStatus = getTestStatus(test.scheduledAt);
                  return (
                    <TableRow
                      key={test.id}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/30 dark:hover:bg-slate-800/20"
                    >
                      <TableCell className="align-middle px-4 py-3.5 max-w-xs sm:max-w-sm md:max-w-md">
                        <div className="space-y-1">
                          <Link
                            href={`/dashboard/admin/test-series/${testSeriesId}/tests/${test.id}`}
                            className="text-xs font-bold text-primary hover:underline block truncate"
                          >
                            {test.name}
                          </Link>
                        
                        </div>
                      </TableCell>
                      <TableCell className="align-middle px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-350 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                          {formatDateTime(test.scheduledAt)}
                        </span>
                      </TableCell>
                      <TableCell className="align-middle px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-350 font-medium">
                          <Clock className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                          {formatDuration(test.durationMinutes)}
                        </span>
                      </TableCell>
                      <TableCell className="align-middle px-4 py-3.5 text-right">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                            testStatus === "UPCOMING"
                              ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                              : testStatus === "CONDUCTED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {testStatus}
                        </span>
                      </TableCell>
                      <TableCell className="align-middle px-4 py-3.5 text-right">
                        <EditTestDialog testSeriesId={testSeriesId} test={test} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-900 rounded-xl select-none shadow-xs">
              <span className="text-[11px] text-muted-foreground font-normal">
                Showing <span className="font-semibold text-foreground">{startEntry}</span> to{" "}
                <span className="font-semibold text-foreground">{endEntry}</span> of{" "}
                <span className="font-semibold text-foreground">{meta.total}</span> tests
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isPlaceholderData}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="cursor-pointer gap-1 border-border h-8.5 text-muted-foreground hover:text-foreground text-xs font-semibold"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages || isPlaceholderData}
                  onClick={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
                  className="cursor-pointer gap-1 border-border h-8.5 text-muted-foreground hover:text-foreground text-xs font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
