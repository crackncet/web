"use client";

import React, { useState, useEffect } from "react";
import { TestSeriesDetail } from "../../_api/test-series.api";
import {
  useMemberTeachingStaffListQuery,
  useAddMemberSubjectsFacultyMutation,
} from "../../_queries/test-series.queries";
import { BookOpen, Users, AlertCircle, UserPlus, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "sonner";
import { UserProfile } from "@/hooks/use-user";

interface MemberStreamsSubjectsTreeProps {
  detail: TestSeriesDetail;
  user: UserProfile | null;
}

export function MemberStreamsSubjectsTree({ detail, user }: MemberStreamsSubjectsTreeProps) {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch teaching staff of role "TEACHER" (only when modal is open)
  const { data: staffResponse, isLoading: isStaffLoading } = useMemberTeachingStaffListQuery(
    "TEACHER",
    isModalOpen
  );
  const teachingStaff = staffResponse?.data || [];

  // Filter teaching staff to the selected stream
  const filteredStaff = teachingStaff.filter(
    (staff) => staff.stream.id === selectedStreamId
  );

  const assignMutation = useAddMemberSubjectsFacultyMutation();

  const handleOpenAssignModal = (streamId: string) => {
    setSelectedStreamId(streamId);
    
    // Find the stream detail from props
    const streamObj = detail.streams.find((s) => s.streamId === streamId);
    if (!streamObj) return;

    // Find teachingStaffIds that are currently assigned
    const currentStaffIds: string[] = [];
    
    // For each subject, find if the assigned teacher matches one in the teachingStaff list
    // Note: teachingStaff is only loaded when modal opens, but we can pre-select once they load or by finding matches.
    setIsModalOpen(true);
  };

  // Pre-populate selected staff IDs once the teachingStaff list is loaded
  useEffect(() => {
    if (isModalOpen && selectedStreamId && teachingStaff.length > 0) {
      const streamObj = detail.streams.find((s) => s.streamId === selectedStreamId);
      if (streamObj) {
        const preselected: string[] = [];
        streamObj.subjects.forEach((sub) => {
          if (sub.teacher) {
            // Find staff object by user id
            const match = teachingStaff.find((s) => s.user.id === sub.teacher?.id);
            if (match) {
              preselected.push(match.id);
            }
          }
        });
        setSelectedStaffIds(preselected);
      }
    }
  }, [isModalOpen, selectedStreamId, teachingStaff, detail.streams]);

  const handleToggleStaff = (staffId: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleSaveAssignments = () => {
    if (!selectedStreamId) return;
    if (selectedStaffIds.length === 0) {
      toast.error("Please select at least one teaching staff member.");
      return;
    }

    assignMutation.mutate(
      {
        testSeriesId: detail.id,
        streamId: selectedStreamId,
        teachingStaffIds: selectedStaffIds,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedStreamId(null);
          setSelectedStaffIds([]);
        },
      }
    );
  };

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
            There are no streams associated with this test series yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {detail.streams.map((stream) => {
            const isHodOfStream =
              user?.isHod &&
              user.hodStreams?.some((s) => s.id === stream.streamId);

            return (
              <div key={stream.streamId} className="space-y-3">
                {/* Stream Header */}
                <div className="flex flex-row items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-black text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      {stream.streamName}
                    </h4>
                  </div>

                  {isHodOfStream && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenAssignModal(stream.streamId)}
                      className="text-xs font-bold h-8.5 rounded-xl cursor-pointer hover:bg-primary/95 flex items-center gap-1.5 select-none"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Assign Faculty
                    </Button>
                  )}
                </div>

                {/* Stream Subjects Table */}
                {stream.subjects.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-955/10">
                    <p className="text-xs text-muted-foreground font-medium">
                      No subjects or faculty assigned to this stream in this test series yet.
                    </p>
                    {isHodOfStream ? (
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Click "Assign Faculty" to link a teacher and populate subjects.
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Stream HOD is responsible for assigning subjects and faculty.
                      </p>
                    )}
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
                        {stream.subjects.map((sub) => {
                          const isCurrentUserTeacher = sub.teacher?.id === user?.id;
                          return (
                            <TableRow
                              key={sub.subjectId}
                              className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/30 dark:hover:bg-slate-800/20"
                            >
                              <TableCell className="align-middle px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-850 dark:text-slate-250">
                                    {sub.subjectName}
                                  </span>
                                  {isCurrentUserTeacher && (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 uppercase tracking-wider">
                                      <CheckCircle2 className="h-2 w-2 shrink-0" />
                                      Me
                                    </span>
                                  )}
                                </div>
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
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Faculty Dialog (HOD Only) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-1.5 select-none">
            <DialogTitle className="font-bold text-lg text-foreground tracking-tight">
              Assign Stream Faculty
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal text-xs leading-relaxed">
              Assign globally registered Teachers (with role TEACHER) from this stream to the test series. This will automatically link their respective subjects.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 select-none">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Select Teachers
            </span>

            {isStaffLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full rounded-lg bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950/10">
                <p className="text-xs text-muted-foreground font-medium">
                  No teachers registered in this stream yet.
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-1 max-w-xs mx-auto">
                  Add team members as stream faculty globally first in the "Manage Teaching Staff" dashboard.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
                {filteredStaff.map((staff) => {
                  const isChecked = selectedStaffIds.includes(staff.id);
                  return (
                    <div
                      key={staff.id}
                      onClick={() => handleToggleStaff(staff.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                        isChecked
                          ? "bg-primary/5 border-primary/45 shadow-2xs"
                          : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-955/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div click
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-850 text-primary focus:ring-primary/40 cursor-pointer shrink-0"
                      />
                      <div className="relative h-7 w-7 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/40">
                        {staff.user.profileImage ? (
                          <Image
                            src={staff.user.profileImage}
                            alt={staff.user.fullName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-primary">
                            {staff.user.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {staff.user.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {staff.subject.name} • {staff.collegeName}
                        </p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                        {staff.role}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={assignMutation.isPending}
              className="text-xs font-semibold h-9.5 cursor-pointer border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveAssignments}
              disabled={assignMutation.isPending || selectedStaffIds.length === 0}
              className="text-xs font-bold h-9.5 cursor-pointer rounded-xl px-4"
            >
              {assignMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Assignments"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
