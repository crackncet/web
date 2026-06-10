"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Database,
  Loader2,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberHeader } from "../../../layout";
import {
  useSharedQuestionBankDetail,
  useSharedSectionQuestions,
} from "../../_queries/question-banks.queries";
import { QuestionItemRow } from "../../_components/question-item-row";

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

export default function SharedQuestionBankViewPage() {
  const params = useParams();
  const router = useRouter();
  const bankId = params.bankId as string;

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sectionPage, setSectionPage] = useState(1);
  const [bankPage, setBankPage] = useState(1);
  const limit = 20;

  // Use Shared Details API instead of regular details API
  const { data: detailResponse, isLoading: isLoadingDetail } = useSharedQuestionBankDetail(
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
  const { data: sectionQuestionsResponse, isLoading: isLoadingSectionQuestions } = useSharedSectionQuestions(
    bankId,
    selectedSectionId || "",
    sectionPage,
    limit
  );

  const sectionQuestions = sectionQuestionsResponse?.data?.questions || [];

  // Activate KaTeX auto rendering whenever questions change
  const currentQuestions = selectedSectionId ? sectionQuestions : (bankDetail?.questions || []);
  const katexDependency = `${currentQuestions.map((q) => q.id).join(",")}`;
  useKaTeX(katexDependency);

  if (isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-2">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading question repository preview...</p>
      </div>
    );
  }

  if (!bankDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <Database className="h-10 w-10 text-destructive mb-4" />
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Question Bank Not Accessible</h3>
        <p className="text-muted-foreground text-xs max-w-md mt-2">
          This question bank is private or you do not have permission to view it. Only the owner or designated teaching staff/HODs can view it once attached.
        </p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4 h-9 text-xs font-semibold">
          Go Back
        </Button>
      </div>
    );
  }

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
              <button onClick={() => router.back()} className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
                <ArrowLeft className="h-3 w-3" /> BACK
              </button>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/90">Shared Question Bank Preview</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground select-none mt-0.5">
              {bankDetail.title} <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wider">Preview Mode</span>
            </h1>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="h-9 px-3.5 text-xs gap-1.5 font-semibold border-slate-200 dark:border-slate-800 hover:bg-muted/10 rounded-lg cursor-pointer bg-white dark:bg-slate-900"
            >
              Return
            </Button>
          </div>
        </div>
      </MemberHeader>

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
                No Questions Found
              </h3>
              <p className="text-muted-foreground text-xs max-w-sm mt-1">
                There are no questions mapped in this section.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Questions ({currentTotal})
                </h3>
              </div>

              {/* Questions List (Read-Only Mode) */}
              <div className="divide-y divide-slate-150 dark:divide-slate-850 px-6">
                {displayedQuestions.map((q, idx) => (
                  <QuestionItemRow
                    key={q.id}
                    question={q}
                    index={(currentPage - 1) * limit + idx + 1}
                    bankId={bankId}
                    readOnly={true} // <-- Forces read-only mode, hiding edit/copy/reuse
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
    </div>
  );
}
