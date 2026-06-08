"use client";

import React, { useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PreviewQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  index: number;
  type: string;
  typeLabel: string;
  correctMarks: string;
  wrongMarks: string;
  partialMarks?: string;
  originalText: string;
  hindiText: string;
  options: Array<{
    id?: string;
    sequence: number;
    originalText: string;
    hindiText?: string;
    isCorrect: boolean;
  }>;
  solutionOriginal: string;
  solutionHindi: string;
  numExact?: string;
  numMin?: string;
  numMax?: string;
  onConfirmSave?: () => void;
  isSaving?: boolean;
}

export function PreviewQuestionDialog({
  open,
  onOpenChange,
  index,
  type,
  typeLabel,
  correctMarks,
  wrongMarks,
  partialMarks,
  originalText,
  hindiText,
  options,
  solutionOriginal,
  solutionHindi,
  numExact,
  numMin,
  numMax,
  onConfirmSave,
  isSaving,
}: PreviewQuestionDialogProps) {
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        if (typeof document !== "undefined") {
          document.body.style.pointerEvents = "auto";
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-[90vw] max-w-[90vw] sm:w-[90vw] sm:max-w-[90vw] max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        <DialogHeader className="pb-3 border-b shrink-0">
          <DialogTitle className="text-sm font-bold text-foreground flex items-center justify-between">
            <span>Preview Rendered Question #{index}</span>
            <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full uppercase tracking-wider">KaTeX Live</span>
          </DialogTitle>
          <DialogDescription className="text-[11px] text-muted-foreground mt-1">
            Review how the question card will look in the workspace with side-by-side translation and math formatting.
          </DialogDescription>
        </DialogHeader>

        {/* Renders the simulated card */}
        <div className="flex-1 my-4 space-y-4 overflow-y-auto pr-1">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
            {/* Meta Row */}
            <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground border-b border-slate-100 dark:border-slate-850 pb-2.5 select-none">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-slate-800 dark:text-slate-200">Q. {index}</span>
                <span className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-primary">{typeLabel || type}</span>
              </div>
              <span className="font-semibold text-right">
                Scheme: <span className="text-emerald-600 dark:text-emerald-400">+{parseFloat(correctMarks || "0")}</span>
                {type === "MCQ_M" && partialMarks && (
                  <> (Partial: <span className="text-indigo-650 dark:text-indigo-400">+{parseFloat(partialMarks || "0")}</span>)</>
                )} / <span className="text-red-500">-{parseFloat(wrongMarks || "0")}</span> Marks
              </span>
            </div>

            {/* Question Text Side-by-Side */}
            <div className={`grid grid-cols-1 ${hindiText.trim() ? "md:grid-cols-2 gap-6" : "block"} text-[12px] leading-relaxed text-slate-800 dark:text-slate-200`}>
              <div className="space-y-2">
                <div className="whitespace-pre-wrap break-words katex-live-preview text-slate-700 dark:text-slate-300 font-medium">
                  {originalText || <span className="text-slate-400 italic">Empty English question text...</span>}
                </div>
              </div>
              {hindiText.trim() && (
                <div className="space-y-2 md:border-l border-slate-200 dark:border-slate-800 md:pl-6">
                  <div className="whitespace-pre-wrap break-words katex-live-preview text-slate-700 dark:text-slate-350 font-medium">
                    {hindiText}
                  </div>
                </div>
              )}
            </div>

            {/* Options List */}
            {(type === "MCQ_S" || type === "MCQ_M") && (
              <div className="space-y-2 pt-2">
                {options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-[11px] transition-all ${
                      opt.isCorrect
                        ? "bg-emerald-50/10 dark:bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className={`h-4.5 w-4.5 shrink-0 flex items-center justify-center rounded-full border text-[9px] font-bold ${
                        opt.isCorrect
                          ? "border-emerald-650 bg-emerald-650 text-white"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-805 text-muted-foreground"
                      }`}
                    >
                      {opt.isCorrect ? <Check className="h-2.5 w-2.5" /> : String.fromCharCode(65 + oIdx)}
                    </span>

                    <div className={`flex-1 ${opt.hindiText?.trim() ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "block"}`}>
                      <div className="break-words katex-live-preview font-medium">
                        {opt.originalText || <span className="text-slate-400 italic">Option {String.fromCharCode(65 + oIdx)} English...</span>}
                      </div>
                      {opt.hindiText?.trim() && (
                        <div className="break-words md:border-l border-slate-200 dark:border-slate-800 md:pl-4 text-slate-505 dark:text-slate-400 katex-live-preview font-medium">
                          {opt.hindiText}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Numerical Answers */}
            {type === "NUM_U" && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-[11px] font-semibold">
                <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-600">Correct Value:</span>
                <span>{numExact || "Not set"}</span>
              </div>
            )}

            {type === "NUM_R" && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-[11px] font-semibold">
                <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-600">Correct Range:</span>
                <span>
                  {numMin || "Min"} to {numMax || "Max"}
                </span>
              </div>
            )}

            {/* Solution Accordion */}
            {(solutionOriginal.trim() || solutionHindi.trim()) && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-1 space-y-2">
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 select-none">
                  Step-by-Step Solution
                </div>
                <div className={`grid grid-cols-1 ${solutionHindi.trim() ? "md:grid-cols-2 gap-6" : "block"} text-[11px] leading-relaxed text-slate-700 dark:text-slate-300`}>
                  <div className="space-y-1">
                    <div className="whitespace-pre-wrap break-words katex-live-preview font-medium">
                      {solutionOriginal}
                    </div>
                  </div>
                  {solutionHindi.trim() && (
                    <div className="space-y-1 md:border-l border-slate-200 dark:border-slate-800 md:pl-6 font-medium">
                      <div className="whitespace-pre-wrap break-words katex-live-preview">
                        {solutionHindi}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t shrink-0 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-8.5 text-xs font-bold rounded-lg border-slate-200 dark:border-slate-800"
          >
            {onConfirmSave ? "Re-edit / Back" : "Back to Editor"}
          </Button>

          {onConfirmSave && (
            <Button
              type="button"
              onClick={onConfirmSave}
              disabled={isSaving}
              className="h-8.5 text-xs font-extrabold bg-emerald-650 hover:bg-emerald-700 text-white rounded-lg shadow-sm px-4"
            >
              {isSaving ? "Saving..." : "Confirm & Save"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
