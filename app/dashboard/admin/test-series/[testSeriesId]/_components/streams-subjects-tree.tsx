"use client";

import React from "react";
import { TestSeriesDetail } from "../../_api/test-series.api";
import { BookOpen, Users, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

interface StreamsSubjectsTreeProps {
  detail: TestSeriesDetail;
}

export function StreamsSubjectsTree({ detail }: StreamsSubjectsTreeProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 tracking-wider uppercase select-none flex items-center gap-2">
        <BookOpen className="h-4.5 w-4.5 text-primary" />
        Associated Streams & Subjects
      </h3>

      {detail.streams.length === 0 ? (
        <Card className="border border-dashed border-border/80 bg-muted/5 py-12 flex flex-col items-center justify-center text-center p-6 select-none rounded-2xl">
          <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/80">
            <Users className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-sm text-foreground">No Streams Linked</h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
            There are no streams associated with this test series yet. Edit the details to link streams.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {detail.streams.map((stream) => (
            <div key={stream.streamId} className="space-y-3">
              {/* Stream Header */}
              <div className="flex flex-row items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h4 className="text-base font-black text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {stream.streamName}
                  </h4>
                </div>
              </div>

              {/* Stream Subjects Table */}
              {stream.subjects.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-955/10">
                  <p className="text-xs text-muted-foreground font-medium">
                    No subjects or faculty assigned to this stream in this test series yet.
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    Stream HOD is responsible for assigning subjects and faculty.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-slate-955/20 hover:bg-slate-50/50 dark:hover:bg-slate-955/20 border-b border-slate-205 dark:border-slate-800">
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4 w-[50%]">
                          Subject
                        </TableHead>
                        <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4 w-[50%]">
                          Assigned Faculty
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stream.subjects.map((sub) => (
                        <TableRow
                          key={sub.subjectId}
                          className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/30 dark:hover:bg-slate-800/20"
                        >
                          <TableCell className="align-middle px-4 py-3">
                            <span className="text-xs font-bold text-slate-850 dark:text-slate-250">
                              {sub.subjectName}
                            </span>
                          </TableCell>
                          <TableCell className="align-middle px-4 py-3">
                            {!sub.teacher ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-semibold bg-rose-500/5 px-2 py-0.5 rounded-md border border-rose-500/10">
                                <AlertCircle className="h-3 w-3 shrink-0" />
                                No faculty assigned
                              </span>
                            ) : (
                              <div className="h-[24px] flex items-center gap-2">
                                <div className="relative h-5 w-5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                                  {sub.teacher.profileImage ? (
                                    <Image
                                      src={sub.teacher.profileImage}
                                      alt={sub.teacher.fullName}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-[8px] font-bold text-primary">
                                      {sub.teacher.fullName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </div>
                                  )}
                                </div>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                  {sub.teacher.fullName}
                                </span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
