"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, AlertCircle, Loader2, ChevronRight, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSubjectDetailQuery, useChaptersQuery, useCreateChapterMutation } from "../_queries/courses.queries";
import { MemberHeader } from "../../layout";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ChapterDetailWorkspace from "./chapter-detail-workspace";

interface SubjectWorkspaceProps {
  courseId: string;
  courseSubjectId: string;
  isAdmin?: boolean;
}

export default function SubjectWorkspace({
  courseId,
  courseSubjectId,
  isAdmin = false,
}: SubjectWorkspaceProps) {
  // Queries
  const {
    data: subjectResponse,
    isLoading: isSubjectLoading,
    error: subjectError,
  } = useSubjectDetailQuery(courseId, courseSubjectId);

  const {
    data: chaptersResponse,
    isLoading: isChaptersLoading,
    error: chaptersError,
  } = useChaptersQuery(courseId, courseSubjectId);

  const subject = subjectResponse?.data;
  const chapters = chaptersResponse?.data || [];

  const { data: user } = useUser();
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Chapter creation state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [chapterSerialNumber, setChapterSerialNumber] = useState("");

  const createChapterMutation = useCreateChapterMutation();

  const isAssignedTeacher =
    subject?.staff.some(
      (member) => member.id === user?.id && member.role === "TEACHER"
    ) || false;

  const handleOpenCreateDialog = () => {
    const maxSerial = chapters.reduce((max, c) => (c.serialNumber > max ? c.serialNumber : max), 0);
    setChapterSerialNumber(String(maxSerial + 1));
    setChapterName("");
    setIsCreateDialogOpen(true);
  };

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName.trim()) {
      toast.error("Please enter a chapter name");
      return;
    }
    const serialNum = parseInt(chapterSerialNumber, 10);
    if (isNaN(serialNum) || serialNum <= 0) {
      toast.error("Please enter a valid positive integer serial number");
      return;
    }

    createChapterMutation.mutate(
      {
        courseId,
        courseSubjectId,
        data: {
          name: chapterName.trim(),
          serialNumber: serialNum,
        },
      },
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
          setChapterName("");
        },
      }
    );
  };

  // Automatically select the first chapter on large screens once chapters are loaded
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapterId) {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setSelectedChapterId(chapters[0].id);
      }
    }
  }, [chapters, selectedChapterId]);

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId);

  const handleChapterClick = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSheetOpen(true);
    }
  };

  const HeaderComponent = isAdmin ? AdminHeader : MemberHeader;
  const backLink = isAdmin
    ? `/dashboard/admin/courses/${courseId}`
    : `/dashboard/member/courses/${courseId}`;

  if (isSubjectLoading || isChaptersLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">
          Loading workspace details...
        </p>
      </div>
    );
  }

  if (subjectError || !subject) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Failed to load subject workspace
        </h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          {subjectError instanceof Error ? subjectError.message : "Subject not found or access denied."}
        </p>
        <Link href={backLink}>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Course
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-slate-950/20">
      {/* Dynamic Dashboard Portal Header */}
      <HeaderComponent>
        <div className="flex items-center gap-2">
          <Link href={backLink}>
            <Button size="icon-sm" variant="outline" className="h-7 w-7 rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs text-slate-400 font-medium">Subject Workspace</span>
        </div>
      </HeaderComponent>

      <div className="w-full max-w-full px-4 py-3 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* LEFT SECTION: Subject Details & Chapters list */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Header info card */}
            <div className="p-3.5 md:p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-md shadow-2xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-primary">
                  {subject.courseName} / {subject.streamName}
                </span>
                <h1 className="text-lg md:text-xl font-black text-slate-850 dark:text-white mt-0.5">
                  {subject.subjectName}
                </h1>
              </div>

              {/* Assigned Staff Section */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <Users className="h-3 w-3" />
                  Assigned Staff
                </div>

                {subject.staff.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No faculty assigned to this subject.</p>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {subject.staff.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 bg-white dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-850/80 shadow-2xs"
                        >
                          <div className="relative h-8 w-8 rounded-full overflow-hidden bg-slate-150 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-slate-800">
                            {member.profileImage ? (
                              <Image
                                src={member.profileImage}
                                alt={member.fullName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] font-medium text-primary">
                                {member.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-normal text-slate-700 dark:text-slate-250 truncate">
                              {member.fullName}
                            </span>
                            <span className="text-[9px] text-slate-400 capitalize">
                              {member.role.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chapters Table card */}
            <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-md shadow-2xs overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">Chapters</h2>
                  <span className="text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md">
                    {chapters.length} Total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isAssignedTeacher && (
                    <Button
                      onClick={handleOpenCreateDialog}
                      size="sm"
                      variant="default"
                      className="h-6 gap-1 text-[10px] px-2 py-3 cursor-pointer"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      Add Chapter
                    </Button>
                  )}
                  
                </div>
              </div>

              {chapters.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground font-medium">No chapters created for this subject yet.</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5">Teachers can create chapters to organize curriculum.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-955/20 hover:bg-slate-50/50 dark:hover:bg-slate-955/20 border-b border-slate-200/60 dark:border-slate-850">
                      <TableHead className="font-bold text-[9px] uppercase text-slate-400 tracking-wider h-8 px-4 w-16">S.No.</TableHead>
                      <TableHead className="font-bold text-[9px] uppercase text-slate-400 tracking-wider h-8 px-2">Chapter Name</TableHead>
                      <TableHead className="font-bold text-[9px] uppercase text-slate-400 tracking-wider h-8 px-4 text-right w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chapters.map((chapter) => {
                      const isSelected = selectedChapterId === chapter.id;
                      return (
                        <TableRow
                          key={chapter.id}
                          onClick={() => handleChapterClick(chapter.id)}
                          className={`border-b border-slate-100 dark:border-slate-800/60 cursor-pointer transition-colors duration-150 ${
                            isSelected
                              ? "bg-primary/5 hover:bg-primary/5 dark:bg-primary/10 dark:hover:bg-primary/10"
                              : "hover:bg-slate-50/40 dark:hover:bg-slate-800/20"
                          }`}
                        >
                          <TableCell className="align-middle px-4 py-2">
                            <span className="text-xs font-normal text-slate-500">
                              {chapter.serialNumber}
                            </span>
                          </TableCell>
                          <TableCell className="align-middle px-2 py-2">
                            <span className="text-xs font-normal text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
                              {chapter.name}
                            </span>
                          </TableCell>
                          <TableCell className="align-middle px-4 py-2 text-right">
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 ml-auto" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: Selected Chapter Detail (lg screens only) */}
          <div className="hidden lg:col-span-6 lg:block lg:sticky lg:top-[76px] self-start animate-fade-in">
            <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-md shadow-2xs overflow-hidden min-h-[350px] flex flex-col">
              {selectedChapter ? (
                <ChapterDetailWorkspace
                  courseId={courseId}
                  courseSubjectId={courseSubjectId}
                  chapterId={selectedChapter.id}
                  isAssignedTeacher={isAssignedTeacher}
                />
              ) : (
                <div className="p-4 md:p-5 flex-grow flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                  <BookOpen className="h-8 w-8 text-slate-300" />
                  <p className="text-xs font-semibold">No chapter selected</p>
                  <p className="text-[10px] max-w-[200px]">
                    Select a chapter from the list to view and manage its contents.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM SHEET: Selected Chapter Detail (< lg screens) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[75vh] sm:h-[75vh] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-0 overflow-hidden flex flex-col">
          {selectedChapter && (
            <div className="flex flex-col h-full overflow-y-auto">
              <ChapterDetailWorkspace
                courseId={courseId}
                courseSubjectId={courseSubjectId}
                chapterId={selectedChapter.id}
                isAssignedTeacher={isAssignedTeacher}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Chapter Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <form onSubmit={handleCreateChapter}>
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <DialogTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Add New Chapter
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                Create a new chapter to organize topics and study materials.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-4">
              <div className="grid gap-1">
                <Label htmlFor="serialNumber" className="text-[10px] uppercase font-bold text-slate-400">
                  Serial Number
                </Label>
                <Input
                  id="serialNumber"
                  type="number"
                  placeholder="e.g. 1"
                  value={chapterSerialNumber}
                  onChange={(e) => setChapterSerialNumber(e.target.value)}
                  className="h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary bg-slate-50/50 dark:bg-slate-950"
                  required
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="name" className="text-[10px] uppercase font-bold text-slate-400">
                  Chapter Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Introduction to Calculus"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  className="h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary bg-slate-50/50 dark:bg-slate-955/10"
                  required
                />
              </div>
            </div>

            <DialogFooter className="flex-row justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateDialogOpen(false)}
                className="text-xs h-8 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs h-8 cursor-pointer"
                disabled={createChapterMutation.isPending}
              >
                {createChapterMutation.isPending ? "Creating..." : "Create Chapter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
