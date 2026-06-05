"use client";

import React, { useState, useEffect } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { examQueryKeys, useExamDetailsQuery } from "../_queries/exams.queries";
import { getExams, createExam, deleteExam } from "../_api/exams.api";
import { toast } from "sonner";

function ExamDetailsSheet({
  examId,
  onClose,
  isMobile,
}: {
  examId: string | null;
  onClose: () => void;
  isMobile: boolean;
}) {
  const { data: exam, isLoading, error } = useExamDetailsQuery(examId);

  return (
    <Sheet open={!!examId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="max-h-[75vh] md:max-h-full sm:h-full w-full md:max-w-md rounded-t-xl md:rounded-t-none border-t sm:border-t-0 sm:border-l p-6 flex flex-col gap-0"
      >
        <SheetHeader className="p-0 border-b border-border pb-4 flex-shrink-0">
          <SheetTitle className="text-lg font-semibold text-foreground">
            Exam Information
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground font-normal">
            Detailed configuration of the exam.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Fetching details...
              </p>
            </div>
          ) : error || !exam ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShieldAlert className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm font-medium text-foreground">
                Failed to load exam details
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-normal">
                {error instanceof Error ? error.message : "Exam may have been deactivated."}
              </p>
            </div>
          ) : (
            <div className="space-y-6 py-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Exam Name
                  </label>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {exam.name}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Exam ID
                  </label>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5 break-all select-all bg-muted/40 p-1.5 rounded border border-border/40">
                    {exam.id}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        exam.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {exam.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Rules Version
                  </label>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    v{exam.currentRulesVersion}
                  </p>
                </div>
              </div>

              {/* Enrollment Rules */}
              <div className="border-t border-border pt-4">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Enrollment Rules
                </label>
                <div className="mt-2">
                  {exam.enrollmentRules && Object.keys(exam.enrollmentRules).length > 0 ? (
                    <pre className="p-3 bg-muted/30 border border-border/40 rounded-lg text-xs font-mono overflow-auto max-h-[300px] leading-normal text-muted-foreground">
                      {JSON.stringify(exam.enrollmentRules, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-xs text-muted-foreground italic font-normal mt-1">
                      No enrollment rules configured.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ExamsSection() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newExamName, setNewExamName] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Suspense query for Exams
  const { data: exams } = useSuspenseQuery({
    queryKey: examQueryKeys.list({ search: searchQuery, isActive: isActiveFilter }),
    queryFn: () => getExams({ search: searchQuery, isActive: isActiveFilter }),
  });

  // Create Mutation
  const { mutate: createMutate, isPending: isCreatePending } = useMutation({
    mutationFn: (name: string) => createExam(name),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.all });
      toast.success(res.message || "Exam created successfully");
      setNewExamName("");
      setIsCreateOpen(false);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create exam";
      toast.error(message);
    },
  });

  // Delete Mutation
  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: (examId: string) => deleteExam(examId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: examQueryKeys.all });
      toast.success(res.message || "Exam deactivated successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to deactivate exam";
      toast.error(message);
    },
  });

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim()) {
      toast.error("Exam name cannot be empty");
      return;
    }
    createMutate(newExamName.trim());
  };

  const statusValue =
    isActiveFilter === true
      ? "ACTIVE"
      : isActiveFilter === false
      ? "INACTIVE"
      : "ALL";

  const triggerSearch = () => {
    setSearchQuery(searchInput);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header bar - Connected Semantic Accent bar (top part of folder layout) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border-b border-border bg-secondary/70">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          {/* Search input with trigger */}
          <div className="relative w-full sm:w-64 flex">
            <Input
              type="text"
              placeholder="Search exams..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  triggerSearch();
                }
              }}
              className="pr-10 h-9 bg-muted/20 border-border focus-visible:ring-primary/20 text-sm w-full"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={triggerSearch}
              className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer rounded-r-lg"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Status select filter */}
          <Select
            value={statusValue}
            onValueChange={(val) => {
              setIsActiveFilter(
                val === "ACTIVE" ? true : val === "INACTIVE" ? false : undefined
              );
            }}
          >
            <SelectTrigger className="h-9 w-full sm:w-[130px] border-border text-xs text-muted-foreground bg-muted/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active Only</SelectItem>
              <SelectItem value="INACTIVE">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="cursor-pointer gap-1.5 h-9 font-medium w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span>Add Exam</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateExam}>
              <DialogHeader>
                <DialogTitle className="font-semibold text-foreground">
                  Create New Exam
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-normal text-xs">
                  Add a new standardized exam category to the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  type="text"
                  placeholder="e.g. NCET, CUET"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  disabled={isCreatePending}
                  className="w-full bg-muted/20 border-border"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreatePending}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatePending} className="cursor-pointer">
                  {isCreatePending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Database list / table - Body of the folder layout */}
      <div className="overflow-x-auto bg-card">
        <Table>
          <TableHeader className="bg-muted/15">
            <TableRow className="border-b border-border select-none">
              <TableHead className="font-medium text-muted-foreground text-xs uppercase px-6 py-3.5">
                Exam Name
              </TableHead>
              <TableHead className="font-medium text-muted-foreground text-xs uppercase px-6 py-3.5">
                Status
              </TableHead>
              <TableHead className="font-medium text-muted-foreground text-xs uppercase px-6 py-3.5 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <ShieldAlert className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="font-medium text-foreground text-sm">
                      No exams found
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5 font-normal">
                      Try adjusting your search or status filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => (
                <TableRow
                  key={exam.id}
                  className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                >
                  <TableCell className="px-6 py-3.5">
                    <button
                      onClick={() => setSelectedExamId(exam.id)}
                      className="hover:underline text-left text-primary hover:text-primary/80 font-medium cursor-pointer"
                    >
                      {exam.name}
                    </button>
                  </TableCell>
                  <TableCell className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        exam.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {exam.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-right">
                    {exam.isActive ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutate(exam.id)}
                        disabled={isDeletePending}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground/50 italic px-2 select-none">
                        Deactivated
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Info Sheet Drawer */}
      <ExamDetailsSheet
        examId={selectedExamId}
        onClose={() => setSelectedExamId(null)}
        isMobile={isMobile}
      />
    </div>
  );
}
