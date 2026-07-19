"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import {
  useMemberTestSeriesDetailQuery,
  useMemberTestSeriesTestsQuery,
  useMemberTestSubjectsQuery,
  useLibraryQuestionBanksQuery,
  useAddMemberQuestionBankMutation,
  useMemberTestSectionsQuery,
  useCreateMemberTestSectionMutation,
  useUpdateMemberTestSectionMutation,
  useDeleteMemberTestSectionMutation,
} from "../../../_queries/test-series.queries";
import { MemberHeader } from "../../../../layout";
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
  Link2,
  Check,
  Loader2,
  Search,
  Plus,
  Trash2,
  Edit3,
  Settings,
  Save,
  LayoutGrid,
} from "lucide-react";
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
import { toast } from "sonner";

export default function MemberTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testSeriesId = params.testSeriesId as string;
  const testId = params.testId as string;

  const { data: user } = useUser();
  const { data: detailResponse, isLoading: isDetailLoading } = useMemberTestSeriesDetailQuery(testSeriesId);
  const { data: testsResponse, isLoading: isTestsLoading } = useMemberTestSeriesTestsQuery(testSeriesId, { limit: 100 });
  const { data: subjectsResponse, isLoading: isSubjectsLoading } = useMemberTestSubjectsQuery(testSeriesId, testId);

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [activeSubjectName, setActiveSubjectName] = useState<string>("");
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search filter states
  const [searchText, setSearchText] = useState("");
  const [searchQueryParam, setSearchQueryParam] = useState("");

  // Fetch teacher's question banks for the active subject when dialog is open
  const { data: banksResponse, isLoading: isBanksLoading } = useLibraryQuestionBanksQuery(
    activeSubjectId || "",
    searchQueryParam,
    isModalOpen && !!activeSubjectId
  );
  const questionBanks = banksResponse?.data || [];

  const attachMutation = useAddMemberQuestionBankMutation();

  const detail = detailResponse?.data;
  const testInfo = testsResponse?.data?.find((t) => t.id === testId);
  const testSubjects = subjectsResponse?.data || [];

  const isLoading = isDetailLoading || isTestsLoading || isSubjectsLoading;

  const { data: sectionsResponse } = useMemberTestSectionsQuery(testSeriesId, testId);
  const sections = sectionsResponse?.data || [];

  const createSectionMutation = useCreateMemberTestSectionMutation();
  const updateSectionMutation = useUpdateMemberTestSectionMutation();
  const deleteSectionMutation = useDeleteMemberTestSectionMutation();

  // Section CRUD input state
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionSequence, setNewSectionSequence] = useState(1);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState("");
  const [editingSectionSequence, setEditingSectionSequence] = useState(1);

  // Attach modal rule configuration states
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [maxQuestionsInput, setMaxQuestionsInput] = useState<string>("");
  const [isOptionalInput, setIsOptionalInput] = useState<boolean>(false);

  const handleOpenAttachModal = (
    subjectId: string,
    subjectName: string,
    currentBankId: string | null,
    currentSectionId: string | null,
    currentMaxQuestions: number | null,
    currentIsOptional: boolean
  ) => {
    setActiveSubjectId(subjectId);
    setActiveSubjectName(subjectName);
    setSelectedBankId(currentBankId);
    setSelectedSectionId(currentSectionId);
    setMaxQuestionsInput(currentMaxQuestions !== null ? String(currentMaxQuestions) : "");
    setIsOptionalInput(currentIsOptional);
    setSearchText("");
    setSearchQueryParam("");
    setIsModalOpen(true);
  };

  const handleSaveQuestionBank = () => {
    if (!activeSubjectId || !selectedBankId) {
      toast.error("Please select a question bank.");
      return;
    }

    const maxQuestionsVal = maxQuestionsInput.trim() ? parseInt(maxQuestionsInput, 10) : null;

    attachMutation.mutate(
      {
        testSeriesId,
        testId,
        subjectId: activeSubjectId,
        questionBankId: selectedBankId,
        sectionId: selectedSectionId || null,
        maxQuestionsToAttempt: maxQuestionsVal,
        isOptional: isOptionalInput,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setActiveSubjectId(null);
          setSelectedBankId(null);
          setSelectedSectionId(null);
          setMaxQuestionsInput("");
          setIsOptionalInput(false);
        },
      }
    );
  };

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
        <Link href={`/dashboard/member/test-series/${testSeriesId}`} className="mt-5">
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
      <MemberHeader>
        <div className="flex items-center gap-3 w-full">
          <Link href={`/dashboard/member/test-series/${testSeriesId}`}>
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
              <span className="text-primary/95">Tests</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-foreground select-none mt-0.5">
              Test Subjects & Question Papers
            </h1>
          </div>
        </div>
      </MemberHeader>

      {/* Test Meta Card */}
      <Card className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 select-none">
        <div className="space-y-3">
          <h2 className="text-lg font-black text-slate-850 dark:text-slate-100 tracking-tight leading-snug">
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

      {/* Test Sections Manager */}
      <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 select-none space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-slate-200">
                Test Sections
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Group subjects into named exam sections (e.g. Physics, Chemistry, Teaching Aptitude) and set rules.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
            {sections.length} Sections
          </span>
        </div>

        {/* Section CRUD Forms & List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Add Section Form */}
          <div className="md:col-span-1 space-y-3 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-955/10 border border-slate-100 dark:border-slate-800/40">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Create New Section
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Section Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Domain Subject: Physics"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Sequence / Order
                </label>
                <input
                  type="number"
                  placeholder="1"
                  value={newSectionSequence}
                  onChange={(e) => setNewSectionSequence(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <Button
                type="button"
                onClick={() => {
                  if (!newSectionName.trim()) {
                    toast.error("Please enter a section name");
                    return;
                  }
                  createSectionMutation.mutate(
                    {
                      testSeriesId,
                      testId,
                      name: newSectionName.trim(),
                      sequence: newSectionSequence,
                    },
                    {
                      onSuccess: () => {
                        setNewSectionName("");
                        setNewSectionSequence(1);
                      },
                    }
                  );
                }}
                disabled={createSectionMutation.isPending}
                className="w-full text-xs font-bold h-9 rounded-xl cursor-pointer"
              >
                {createSectionMutation.isPending ? "Creating..." : "Add Section"}
              </Button>
            </div>
          </div>

          {/* Sections List */}
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Existing Sections
            </h4>

            {sections.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/10 text-muted-foreground text-xs">
                No sections defined for this test. All attached papers will be treated as part of the default exam flow.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {sections.map((sec) => {
                  const isEditing = editingSectionId === sec.id;
                  return (
                    <div
                      key={sec.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:bg-slate-50/30 dark:hover:bg-slate-955/5 transition-all duration-200"
                    >
                      {isEditing ? (
                        <div className="flex-1 flex gap-2 mr-4">
                          <input
                            type="text"
                            value={editingSectionName}
                            onChange={(e) => setEditingSectionName(e.target.value)}
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100"
                          />
                          <input
                            type="number"
                            value={editingSectionSequence}
                            onChange={(e) => setEditingSectionSequence(parseInt(e.target.value, 10) || 1)}
                            className="w-16 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center">
                            {sec.sequence}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {sec.name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (!editingSectionName.trim()) {
                                  toast.error("Please enter a section name");
                                  return;
                                }
                                updateSectionMutation.mutate(
                                  {
                                    testSeriesId,
                                    testId,
                                    sectionId: sec.id,
                                    name: editingSectionName.trim(),
                                    sequence: editingSectionSequence,
                                  },
                                  {
                                    onSuccess: () => setEditingSectionId(null),
                                  }
                                );
                              }}
                              disabled={updateSectionMutation.isPending}
                              className="h-8 w-8 p-0 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingSectionId(null)}
                              className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingSectionId(sec.id);
                                setEditingSectionName(sec.name);
                                setEditingSectionSequence(sec.sequence);
                              }}
                              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-500/10"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete section "${sec.name}"?`)) {
                                  deleteSectionMutation.mutate({
                                    testSeriesId,
                                    testId,
                                    sectionId: sec.id,
                                  });
                                }
                              }}
                              disabled={deleteSectionMutation.isPending}
                              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Subjects & Question Papers Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 tracking-wider uppercase select-none flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-primary" />
          Test Subjects List
        </h3>

        {testSubjects.length === 0 ? (
          <Card className="border border-dashed border-border/80 bg-muted/5 py-12 flex flex-col items-center justify-center text-center p-6 select-none rounded-2xl">
            <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/80">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-foreground">No Subjects Configured</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
              No subjects have been linked to this test series stream yet.
            </p>
          </Card>
        ) : (
          <div className="border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
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
                  <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">
                    Section & Rules
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
                  let teacherUserId = "";

                  for (const str of detail.streams) {
                    const matchedSub = str.subjects.find((s) => s.subjectId === sub.subjectId);
                    if (matchedSub) {
                      streamName = str.streamName;
                      if (matchedSub.teacher) {
                        teacherName = matchedSub.teacher.fullName;
                        teacherUserId = matchedSub.teacher.id;
                      }
                      break;
                    }
                  }

                  const isCurrentUserTeacher = teacherUserId === user?.id;

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
                        {isCurrentUserTeacher && (
                          <span className="ml-1.5 inline-flex px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-wider">
                            You
                          </span>
                        )}
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
                      <TableCell className="align-middle px-4 py-3.5">
                        {sub.questionBank ? (
                          <div className="flex flex-col gap-1">
                            {sub.sectionId ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 w-fit">
                                <LayoutGrid className="h-3 w-3 shrink-0" />
                                {sections.find((s) => s.id === sub.sectionId)?.name || "Unknown Section"}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-medium italic">
                                No Section (Legacy)
                              </span>
                            )}
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {sub.maxQuestionsToAttempt !== null ? (
                                <span className="inline-flex px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider">
                                  Max Attempt: {sub.maxQuestionsToAttempt} Qs
                                </span>
                              ) : (
                                <span className="inline-flex px-1.5 py-0.2 rounded bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[9px] font-black uppercase tracking-wider">
                                  All Questions
                                </span>
                              )}
                              {sub.isOptional && (
                                <span className="inline-flex px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase tracking-wider">
                                  Optional
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="align-middle px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Attach/Change Question Bank Action (Teacher Only) */}
                          {isCurrentUserTeacher && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleOpenAttachModal(
                                  sub.subjectId,
                                  sub.subjectName,
                                  sub.questionBank?.id || null,
                                  sub.sectionId,
                                  sub.maxQuestionsToAttempt,
                                  sub.isOptional
                                )
                              }
                              className="text-xs font-bold h-8 rounded-lg cursor-pointer border-slate-200 dark:border-slate-800 hover:text-primary select-none"
                            >
                              <Link2 className="h-3.5 w-3.5 mr-1" />
                              {sub.questionBank ? "Change QB" : "Attach QB"}
                            </Button>
                          )}

                          {/* View Question Bank Action (If attached) */}
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
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Attach Question Bank Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[460px] p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-1.5 select-none animate-in fade-in duration-200">
            <DialogTitle className="font-bold text-lg text-foreground tracking-tight">
              Attach Question Bank
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal text-xs leading-relaxed">
              Search and select a Question Bank from your personal library for <strong className="text-foreground">{activeSubjectName}</strong>.
            </DialogDescription>
          </DialogHeader>

          {/* Search Input Filter */}
          <div className="flex gap-2 my-2 select-none animate-in slide-in-from-top-1 duration-200">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchQueryParam(searchText);
                }
              }}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 bg-transparent text-slate-850 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSearchQueryParam(searchText)}
              className="text-xs font-bold h-9.5 rounded-xl px-4 cursor-pointer gap-1"
            >
              <Search className="h-3.5 w-3.5" /> Search
            </Button>
          </div>

          <div className="space-y-3 my-2 select-none">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Select Library Paper (Latest 3)
            </span>

            {isBanksLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full rounded-lg bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : questionBanks.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-955/10 animate-in fade-in">
                <p className="text-xs text-muted-foreground font-medium">
                  No active question banks found.
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-1 max-w-xs mx-auto">
                  Try typing a different name or verify that the Question Bank is active.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[25vh] overflow-y-auto pr-1 animate-in fade-in duration-200">
                {questionBanks.map((bank) => {
                  const isSelected = selectedBankId === bank.id;
                  return (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                        isSelected
                          ? "bg-primary/5 border-primary/45 shadow-2xs"
                          : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-955/20"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate">
                          {bank.title}
                        </p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate">
                          ID: {bank.id}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rules Configuration */}
          <div className="space-y-4 my-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">
              Section & Attempt Rules
            </span>

            {/* Section dropdown select */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-350">
                Assigned Section
              </label>
              <select
                value={selectedSectionId || ""}
                onChange={(e) => setSelectedSectionId(e.target.value || null)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">No Section (Unassigned)</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} (Seq: {sec.sequence})
                  </option>
                ))}
              </select>
            </div>

            {/* Max Questions to Attempt */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-350">
                Max Questions to Attempt
              </label>
              <input
                type="number"
                placeholder="Leave blank for unlimited (attempt all)"
                value={maxQuestionsInput}
                onChange={(e) => setMaxQuestionsInput(e.target.value)}
                min="1"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-205 dark:border-slate-800 bg-transparent text-slate-850 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Maximum number of questions a student can submit in this subject slot. Exceeded submissions are ignored.
              </p>
            </div>

            {/* Is Optional Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isOptional"
                checked={isOptionalInput}
                onChange={(e) => setIsOptionalInput(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isOptional" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                Is Optional Subject / Paper slot
              </label>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={attachMutation.isPending}
              className="text-xs font-semibold h-9.5 cursor-pointer border-slate-200 dark:border-slate-800 text-muted-foreground hover:text-foreground rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveQuestionBank}
              disabled={attachMutation.isPending || !selectedBankId}
              className="text-xs font-bold h-9.5 cursor-pointer rounded-xl px-4"
            >
              {attachMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Paper"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
