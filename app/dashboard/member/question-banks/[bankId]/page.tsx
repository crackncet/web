"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Upload,
  Database,
  Loader2,
  FolderOpen,
  HelpCircle,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberHeader } from "../../layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useQuestionBankDetail,
  useSectionQuestions,
  useCreateQuestionBankSection,
} from "../_queries/question-banks.queries";
import { toast } from "sonner";
import { EditQuestionDialog } from "../_components/edit-question-dialog";
import { QuestionItemRow } from "../_components/question-item-row";
import { BatchUploadDialog } from "../_components/batch-upload-dialog";

// ─── KaTeX Dynamic Injection Hook ───────────────────────────────────────────
function useKaTeX(triggerDependency: any) {
  useEffect(() => {
    // Add KaTeX CSS
    if (!document.getElementById("katex-css")) {
      const link = document.createElement("link");
      link.id = "katex-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
      document.head.appendChild(link);
    }
    // Add KaTeX JS
    if (!document.getElementById("katex-js")) {
      const script = document.createElement("script");
      script.id = "katex-js";
      script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
      script.onload = () => {
        // Add auto-render JS
        if (!document.getElementById("katex-auto-render-js")) {
          const autoScript = document.createElement("script");
          autoScript.id = "katex-auto-render-js";
          autoScript.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js";
          autoScript.onload = () => {
            if ((window as any).renderMathInElement) {
              (window as any).renderMathInElement(document.body, {
                delimiters: [
                  { left: "$$", right: "$$", display: true },
                  { left: "$", right: "$", display: false },
                ],
              });
            }
          };
          document.head.appendChild(autoScript);
        }
      };
      document.head.appendChild(script);
    } else {
      if ((window as any).renderMathInElement) {
        // Delay slightly to let React render nodes
        setTimeout(() => {
          (window as any).renderMathInElement(document.body, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
            ],
          });
        }, 100);
      }
    }
  }, [triggerDependency]);
}

export default function QuestionBankWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const bankId = params.bankId as string;

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sectionPage, setSectionPage] = useState(1);
  const [bankPage, setBankPage] = useState(1);
  const limit = 20;

  // Dialog states
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionSeq, setSectionSeq] = useState("1");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [createQuestionOpen, setCreateQuestionOpen] = useState(false);

  // Queries
  const { data: detailResponse, isLoading: isLoadingDetail, refetch: refetchDetail } = useQuestionBankDetail(
    bankId,
    bankPage,
    limit
  );

  const bankDetail = detailResponse?.data;
  const sections = bankDetail?.sections || [];

  // Automatically select first section if sections are present and none selected
  useEffect(() => {
    if (sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  // Query for section questions if a section is active
  const { data: sectionQuestionsResponse, isLoading: isLoadingSectionQuestions } = useSectionQuestions(
    bankId,
    selectedSectionId || "",
    sectionPage,
    limit
  );

  const sectionQuestions = sectionQuestionsResponse?.data?.questions || [];
  const sectionQuestionsMeta = sectionQuestionsResponse || { total: 0, totalPages: 0 };

  // Mutations
  const createSectionMutation = useCreateQuestionBankSection(bankId);

  // Activate KaTeX auto rendering whenever questions change
  const currentQuestions = selectedSectionId ? sectionQuestions : (bankDetail?.questions || []);
  const katexDependency = `${currentQuestions.map((q) => q.id).join(",")}`;
  useKaTeX(katexDependency);

  // Handlers
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) {
      toast.error("Please enter a section title");
      return;
    }

    try {
      await createSectionMutation.mutateAsync({
        title: sectionTitle.trim(),
        sequence: parseInt(sectionSeq, 10) || 1,
      });
      toast.success("Section created successfully!");
      setSectionOpen(false);
      setSectionTitle("");
      setSectionSeq((sections.length + 2).toString());
      refetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create section");
    }
  };


  if (isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-2">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading workspace details...</p>
      </div>
    );
  }

  if (!bankDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <Database className="h-10 w-10 text-destructive mb-4" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Question Bank Not Found</h3>
        <p className="text-muted-foreground text-xs max-w-md mt-2">
          The requested question bank repository does not exist or you do not have permissions to view it.
        </p>
        <Link href="/dashboard/member/question-banks" className="mt-4">
          <Button variant="outline" className="h-9 text-xs font-semibold">
            Back to Question Banks
          </Button>
        </Link>
      </div>
    );
  }

  // Questions to display based on whether we have sections or not
  const displayedQuestions = selectedSectionId ? sectionQuestions : (bankDetail.questions || []);
  const isLoadingQuestions = selectedSectionId ? isLoadingSectionQuestions : false;
  
  const currentTotal = selectedSectionId
    ? (sectionQuestionsResponse?.meta?.total || 0)
    : (detailResponse?.meta?.total || 0);
  const currentTotalPages = selectedSectionId
    ? (sectionQuestionsResponse?.meta?.totalPages || 0)
    : (detailResponse?.meta?.totalPages || 0);
  const currentPage = selectedSectionId ? sectionPage : bankPage;
  const setPage = selectedSectionId ? setSectionPage : setBankPage;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <MemberHeader>
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
              <Link href="/dashboard/member/question-banks" className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> QUESTION BANKS
              </Link>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/90">Workspace</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground select-none mt-0.5">
              {bankDetail.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSectionSeq((sections.length + 1).toString());
                setSectionOpen(true);
              }}
              className="h-9 px-3 text-xs gap-1.5 font-semibold border-slate-200 dark:border-slate-800 hover:bg-muted/10 rounded-lg cursor-pointer bg-white dark:bg-slate-900"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
            <Button
              variant="outline"
              onClick={() => setCreateQuestionOpen(true)}
              className="h-9 px-3 text-xs gap-1.5 font-semibold border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 rounded-lg cursor-pointer bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400"
            >
              <Plus className="h-4 w-4" />
              Create Question
            </Button>
            <Button
              onClick={() => setUploadOpen(true)}
              className="h-9 px-4 text-xs gap-1.5 font-bold shadow-xs bg-primary hover:bg-primary/90 text-white rounded-lg transition-all"
            >
              <Upload className="h-4 w-4" />
              Upload Markdown (.md)
            </Button>
          </div>
        </div>
      </MemberHeader>

      {/* Main Workspace Layout - Left Sidebar for Sections (if any), Right for Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sections Sidebar */}
        {sections.length > 0 && (
          <div className="lg:col-span-3 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sections ({sections.length})
              </h2>
            </div>
            <div className="flex flex-col gap-1 select-none">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setSelectedSectionId(sec.id);
                    setSectionPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                    selectedSectionId === sec.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                  }`}
                >
                  <span className="truncate pr-2">{sec.title}</span>
                  <span className="text-[10px] shrink-0 text-muted-foreground/60">Seq {sec.sequence}</span>
                </button>
              ))}

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

              <button
                onClick={() => {
                  setSelectedSectionId("unassigned");
                  setSectionPage(1);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                  selectedSectionId === "unassigned"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                }`}
              >
                <span className="truncate pr-2 font-medium">Unassigned Questions</span>
                <span className="text-[10px] shrink-0 text-muted-foreground/60">General</span>
              </button>
            </div>
          </div>
        )}

        {/* Questions Area */}
        <div className={`${sections.length > 0 ? "lg:col-span-9" : "lg:col-span-12"} space-y-4`}>
          {isLoadingQuestions ? (
            <div className="flex flex-col items-center justify-center p-16 gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Loading questions...</p>
            </div>
          ) : displayedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="p-3 bg-primary/10 text-primary rounded-xl mb-3">
                <FolderOpen className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-xs">
                No Questions Added
              </h3>
              <p className="text-muted-foreground text-xs max-w-sm mt-1">
                {selectedSectionId
                  ? "There are no questions mapped in this section. Upload a Markdown file to add questions."
                  : "There are no questions in this question bank. Upload a Markdown file to start."}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Questions ({currentTotal})
                </h3>
              </div>

              {/* Questions List without unnecessary card padding */}
              <div className="divide-y divide-slate-150 dark:divide-slate-850 px-6">
                {displayedQuestions.map((q, idx) => (
                  <QuestionItemRow
                    key={q.id}
                    question={q}
                    index={(currentPage - 1) * limit + idx + 1}
                    bankId={bankId}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {currentTotalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/20 select-none">
                  <span className="text-xs text-muted-foreground">
                    Showing {(currentPage - 1) * limit + 1} to{" "}
                    {Math.min(currentPage * limit, currentTotal)} of {currentTotal} questions
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev: number) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                    >
                      Previous
                    </Button>
                    <div className="h-8 px-3 flex items-center justify-center border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold min-w-[2.25rem]">
                      {currentPage}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev: number) => Math.min(prev + 1, currentTotalPages))}
                      disabled={currentPage === currentTotalPages}
                      className="h-8 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Create Section Dialog ─────────────────────────────────────────── */}
      <Dialog open={sectionOpen} onOpenChange={setSectionOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-850 dark:text-slate-100">
              Create Section
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a new category section inside this question bank to group questions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSection} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-750 dark:text-slate-350">
                Section Title
              </Label>
              <Input
                placeholder="e.g., Single Correct MCQs, Numerical Type"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-750 dark:text-slate-350">
                Sequence Order
              </Label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={sectionSeq}
                onChange={(e) => setSectionSeq(e.target.value)}
                className="h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                required
              />
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSectionOpen(false)}
                className="h-9 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSectionMutation.isPending}
                className="h-9 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-white min-w-[100px]"
              >
                {createSectionMutation.isPending && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Upload Markdown (.md) Dialog ─────────────────────────────────── */}
      <BatchUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        bankId={bankId}
        onSuccess={refetchDetail}
      />

      {createQuestionOpen && (
        <EditQuestionDialog
          open={createQuestionOpen}
          onOpenChange={setCreateQuestionOpen}
          bankId={bankId}
        />
      )}
    </div>
  );
}
