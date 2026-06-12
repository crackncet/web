"use client";

import React, { useState } from "react";
import { Database, Plus, Search, Loader2, RotateCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberHeader } from "../layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMySubjectsQuery } from "../media/_queries/media.queries";
import { useQuestionBanks, useCreateQuestionBank } from "./_queries/question-banks.queries";
import { toast } from "sonner";

export default function QuestionBanksPage() {
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState<string>("all");
  const [isActive, setIsActive] = useState<string>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");

  // Queries & Mutations
  const { data: subjectsResponse, isLoading: isLoadingSubjects } = useMySubjectsQuery();
  const subjects = subjectsResponse?.data || [];
  
  const {
    data: qbResponse,
    isLoading: isLoadingBanks,
    refetch: refetchBanks,
  } = useQuestionBanks({
    search: search.trim() || undefined,
    subjectId: subjectId === "all" ? undefined : subjectId,
    isActive: isActive === "all" ? undefined : isActive === "true",
  });

  const createMutation = useCreateQuestionBank();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a question bank title");
      return;
    }
    if (!newSubjectId) {
      toast.error("Please select a subject");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: newTitle.trim(),
        subjectId: newSubjectId,
      });
      toast.success("Question bank created successfully!");
      setCreateOpen(false);
      setNewTitle("");
      setNewSubjectId("");
      refetchBanks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create question bank");
    }
  };

  const banks = qbResponse?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <MemberHeader>
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
              <span>LIBRARY</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/90">Question Banks</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground select-none mt-0.5">
              Question Banks
            </h1>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-9 px-4 text-xs gap-1.5 font-bold shadow-xs bg-primary hover:bg-primary/90 text-white rounded-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Question Bank
          </Button>
        </div>
      </MemberHeader>

      {/* Clean Search & Filter UI */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search by document title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSearch("");
              refetchBanks();
            }}
            className="h-9 w-9 p-0 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-muted-foreground/80 hover:text-foreground"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger className="w-[180px] h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={isActive} onValueChange={setIsActive}>
            <SelectTrigger className="w-[130px] h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active Only</SelectItem>
              <SelectItem value="false">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table listing */}
      {isLoadingBanks ? (
        <div className="flex flex-col items-center justify-center p-16 gap-2">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Loading question banks...</p>
        </div>
      ) : banks.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="p-4 bg-primary/10 text-primary rounded-2xl mb-4">
            <Database className="h-10 w-10" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            No Question Banks Found
          </h3>
          <p className="text-muted-foreground text-xs max-w-md mt-2">
            {search || subjectId !== "all" || isActive !== "all"
              ? "Try adjusting your filters or search terms to find what you are looking for."
              : "Create a new question bank to start building questions, sections, and importing markdown question papers."}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <Table>
            <TableHeader className="bg-slate-50/75 dark:bg-slate-900">
              <TableRow className="border-b border-slate-200 dark:border-slate-800">
                <TableHead className="w-16 text-center font-bold text-xs text-slate-500 dark:text-slate-400">
                  S.No.
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-500 dark:text-slate-400">
                  Name
                </TableHead>
                <TableHead className="font-bold text-xs text-slate-500 dark:text-slate-400">
                  Subject
                </TableHead>
                <TableHead className="w-32 text-center font-bold text-xs text-slate-500 dark:text-slate-400">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banks.map((bank, index) => (
                <TableRow
                  key={bank.id}
                  className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 dark:text-slate-200">
                    <Link
                      href={`/dashboard/member/question-banks/${bank.id}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {bank.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                    {bank.subjectName || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium select-none ${
                        bank.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          bank.isActive ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
                        }`}
                      />
                      {bank.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Creation Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-850 dark:text-slate-100">
              Create Question Bank
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a new question bank repository in your library to start adding questions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-750 dark:text-slate-350">
                Question Bank Title
              </Label>
              <Input
                placeholder="e.g., Physics Mechanics DPP-1, History Unit 2"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-750 dark:text-slate-350">
                Subject
              </Label>
              {isLoadingSubjects ? (
                <div className="h-9 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select value={newSubjectId} onValueChange={setNewSubjectId}>
                  <SelectTrigger className="w-full h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Select assigned subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name} ({sub.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
                className="h-9 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-9 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-white min-w-[100px]"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : null}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
