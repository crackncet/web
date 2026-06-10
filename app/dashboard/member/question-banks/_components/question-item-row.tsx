"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Check, ChevronUp, ChevronDown, Edit, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditQuestionDialog } from "./edit-question-dialog";
import { CopyReuseQuestionDialog } from "./copy-reuse-dialog";

interface QuestionItemRowProps {
  question: any;
  index: number;
  bankId?: string; // If passed, enables database updates
  onUpdateInMemory?: (updatedQuestion: any) => void; // If passed, updates parent memory state
  readOnly?: boolean;
}

export function QuestionItemRow({ question, index, bankId, onUpdateInMemory, readOnly = false }: QuestionItemRowProps) {
  const params = useParams();
  const resolvedBankId = bankId || (params?.bankId as string);

  const [isSolutionOpen, setIsSolutionOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [reuseOpen, setReuseOpen] = useState(false);

  // Map question type code to human label
  const typeLabels: Record<string, string> = {
    MCQ_S: "Single Correct MCQ",
    MCQ_M: "Multiple Correct MCQ",
    NUM_U: "Numerical (Exact)",
    NUM_R: "Numerical (Range)",
  };

  // Re-run KaTeX on DOM mutations when solution or options are opened
  useEffect(() => {
    if ((isSolutionOpen || isOptionsOpen) && (window as any).renderMathInElement) {
      const timer = setTimeout(() => {
        (window as any).renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSolutionOpen, isOptionsOpen]);

  return (
    <div className="py-6 space-y-4 animate-in fade-in duration-200 group relative">
      {/* Meta Row: Q index, type, marks */}
      <div className="flex items-center justify-between gap-3 text-[11px] select-none text-muted-foreground/85">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Q. {index}</span>
          <span className="h-3.5 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="font-semibold text-primary">{typeLabels[question.type] || question.type}</span>
          {!readOnly && (resolvedBankId || onUpdateInMemory) && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditOpen(true)}
                className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer ml-1.5 inline-flex items-center justify-center"
                title="Edit Question"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCopyOpen(true)}
                className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer ml-1 inline-flex items-center justify-center"
                title="Copy Question"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setReuseOpen(true)}
                className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-indigo-650 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer ml-1 inline-flex items-center justify-center"
                title="Reuse Question"
              >
                <Link2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
        <span className="font-semibold">
          Scheme: <span className="text-emerald-600 dark:text-emerald-400">+{parseFloat(question.correctMarks)}</span> /{" "}
          <span className="text-red-500">-{parseFloat(question.wrongMarks)}</span> Marks
        </span>
      </div>

      {/* Side-by-side or full-width translations */}
      <div className={question.hindiText ? "grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-800 dark:text-slate-200" : "text-sm text-slate-800 dark:text-slate-200"}>
        {/* English (Original) column */}
        <div className="space-y-3">
          <div className="whitespace-pre-wrap leading-relaxed break-words text-slate-700 dark:text-slate-355">
            {question.originalText}
          </div>
          {question.originalImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={question.originalImage}
              alt=""
              className="max-h-48 max-w-full object-contain rounded-lg border border-slate-200 dark:border-slate-800"
            />
          )}
        </div>

        {/* Hindi column (only if present) */}
        {question.hindiText && (
          <div className="space-y-3 border-l border-slate-200 dark:border-slate-800 pl-6">
            <div className="whitespace-pre-wrap leading-relaxed break-words text-slate-700 dark:text-slate-355">
              {question.hindiText}
            </div>
            {question.hindiImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={question.hindiImage}
                alt=""
                className="max-h-48 max-w-full object-contain rounded-lg border border-slate-200 dark:border-slate-800"
              />
            )}
          </div>
        )}
      </div>

      {/* Answer Key / Option Presentation */}
      <div className="pt-2">
        <button
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors select-none cursor-pointer"
        >
          {isOptionsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {isOptionsOpen
            ? (question.type === "MCQ_S" || question.type === "MCQ_M" ? "Hide Options" : "Hide Correct Answer")
            : (question.type === "MCQ_S" || question.type === "MCQ_M" ? "Show Options" : "Show Correct Answer")
          }
        </button>

        {isOptionsOpen && (
          <div className="mt-3">
            {/* MCQ Presentation */}
            {(question.type === "MCQ_S" || question.type === "MCQ_M") && (
              <div className="space-y-2.5">
                {question.options?.map((opt: any, i: number) => (
                  <div
                    key={opt.id || `opt-${opt.sequence ?? i}`}
                    className={`flex items-start gap-3.5 p-3.5 rounded-xl border text-xs transition-all duration-200 ${
                      opt.isCorrect
                        ? "bg-emerald-50/10 dark:bg-emerald-500/5 border-emerald-500/35 text-emerald-950 dark:text-emerald-400 shadow-xs"
                        : "border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-900/50 hover:bg-slate-50/40 dark:hover:bg-slate-900 text-slate-655 dark:text-slate-350"
                    }`}
                  >
                    <span
                      className={`mt-0.5 h-5 w-5 shrink-0 flex items-center justify-center rounded-full border text-[10px] font-bold transition-all ${
                        opt.isCorrect
                          ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                          : "border-slate-350 dark:border-slate-700 bg-slate-55 dark:bg-slate-800 text-muted-foreground"
                      }`}
                    >
                      {opt.isCorrect ? <Check className="h-3 w-3" /> : String.fromCharCode(65 + opt.sequence)}
                    </span>
                    
                    <div className={`flex-1 ${opt.hindiText ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "block"}`}>
                      <div className="break-words font-medium leading-relaxed">{opt.originalText}</div>
                      {opt.hindiText && (
                        <div className="break-words font-medium leading-relaxed md:border-l border-slate-200 dark:border-slate-800 md:pl-4 text-slate-500 dark:text-slate-400">
                          {opt.hindiText}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Numerical Value Presentation */}
            {question.type === "NUM_U" && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/35 text-emerald-800 dark:text-emerald-400 text-xs shadow-xs font-semibold">
                <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-600">Correct Value:</span>
                <span>{parseFloat(question.numExact)}</span>
              </div>
            )}

            {/* Numerical Range Presentation */}
            {question.type === "NUM_R" && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/35 text-emerald-800 dark:text-emerald-400 text-xs shadow-xs font-semibold">
                <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-650">Correct Range:</span>
                <span>
                  {parseFloat(question.numMin)} to {parseFloat(question.numMax)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Solution accordion if solution exists */}
      {question.solution && (
        <div className="pt-2">
          <button
            onClick={() => setIsSolutionOpen(!isSolutionOpen)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors select-none cursor-pointer"
          >
            {isSolutionOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {isSolutionOpen ? "Hide Solution Explanation" : "Show Solution Explanation"}
          </button>
          
          {isSolutionOpen && (
            <div className="mt-3 p-5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-55/50 dark:bg-slate-900/30 text-xs text-slate-700 dark:text-slate-355 animate-in slide-in-from-top-2 duration-200">
              <div className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 select-none">
                Step-by-Step Solution
              </div>
              <div className={question.solution.hindiText ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "block"}>
                <div className="space-y-3">
                  <div className="whitespace-pre-wrap leading-relaxed break-words">{question.solution.originalText}</div>
                  {question.solution.originalImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={question.solution.originalImage}
                      alt=""
                      className="max-h-48 max-w-full object-contain rounded border border-slate-200 dark:border-slate-800"
                    />
                  )}
                </div>
                {question.solution.hindiText && (
                  <div className="space-y-3 border-l border-slate-200 dark:border-slate-800 pl-6">
                    <div className="whitespace-pre-wrap leading-relaxed break-words">{question.solution.hindiText}</div>
                    {question.solution.hindiImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={question.solution.hindiImage}
                        alt=""
                        className="max-h-48 max-w-full object-contain rounded border border-slate-200 dark:border-slate-800"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workspace Edit Dialog */}
      {editOpen && (
        <EditQuestionDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          question={question}
          index={index}
          bankId={resolvedBankId}
          onUpdateInMemory={onUpdateInMemory}
        />
      )}

      {/* Copy Question Dialog */}
      {copyOpen && (
        <CopyReuseQuestionDialog
          open={copyOpen}
          onOpenChange={setCopyOpen}
          question={question}
          mode="copy"
          bankId={resolvedBankId}
        />
      )}

      {/* Reuse Question Dialog */}
      {reuseOpen && (
        <CopyReuseQuestionDialog
          open={reuseOpen}
          onOpenChange={setReuseOpen}
          question={question}
          mode="reuse"
          bankId={resolvedBankId}
        />
      )}
    </div>
  );
}