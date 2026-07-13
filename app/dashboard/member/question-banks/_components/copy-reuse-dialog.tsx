"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, Keyboard, Languages, Loader2, Sparkles, X, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useQuestionBanks,
  useQuestionBankDetail,
  useCopyQuestion,
  useReuseQuestion,
  useTranslateQuestions,
} from "../_queries/question-banks.queries";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { toast } from "sonner";
import { KeymanOskPanel } from "./virtual-keyboard";
import { VisualMathTextEditor } from "./visual-math-text-editor";

interface CopyReuseQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: any;
  mode: "copy" | "reuse";
  bankId: string;
}

export function CopyReuseQuestionDialog({
  open,
  onOpenChange,
  question,
  mode,
  bankId,
}: CopyReuseQuestionDialogProps) {
  // Target Selection State
  const [targetBankId, setTargetBankId] = useState<string>(bankId);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);

  // Edit State (Only relevant for Copy mode)
  const [originalText, setOriginalText] = useState(question?.originalText || "");
  const [hindiText, setHindiText] = useState(question?.hindiText || "");
  const [options, setOptions] = useState<any[]>([]);
  const [solutionOriginal, setSolutionOriginal] = useState(question?.solution?.originalText || "");
  const [solutionHindi, setSolutionHindi] = useState(question?.solution?.hindiText || "");

  // Keyboard panel state
  const [keyboardMode, setKeyboardMode] = useState<"keyman" | null>(null);
  const [keymanLocale, setKeymanLocale] = useState("@hi");
  const [mathLiveVisible, setMathLiveVisible] = useState(false);
  const [activeField, setActiveField] = useState<{
    id: string;
    ref: HTMLTextAreaElement | HTMLInputElement | null;
  } | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Track MathLive keyboard visibility
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mvk = (window as any).mathVirtualKeyboard;
    if (!mvk) return;
    const handler = () => setMathLiveVisible(!!mvk.visible);
    mvk.addEventListener("geometrychange", handler);
    return () => mvk.removeEventListener("geometrychange", handler);
  }, [open]);

  // Close keyboard panel when sheet closes
  useEffect(() => {
    if (!open) {
      setKeyboardMode(null);
      setActiveField(null);
      setMathLiveVisible(false);
      if (typeof window !== "undefined" && (window as any).mathVirtualKeyboard) {
        try {
          (window as any).mathVirtualKeyboard.hide();
        } catch (e) {}
      }
    }
  }, [open]);

  // Load MathLive and configure layouts
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const configureMvk = () => {
      const MFE = (window as any).MathfieldElement;
      if (MFE) {
        MFE.sharedVirtualKeyboardTargetOrigin = window.origin;
        MFE.mathVirtualKeyboardPolicy = "auto";
      }
    };

    if ((window as any).MathfieldElement) {
      configureMvk();
      return;
    }

    if (!document.querySelector("script[data-mathlive]")) {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/mathlive";
      s.async = true;
      s.setAttribute("data-mathlive", "1");
      s.onload = configureMvk;
      document.head.appendChild(s);
    }
  }, [open]);

  // Sync initial question values (for Copy mode)
  useEffect(() => {
    if (open && question) {
      setOriginalText(question.originalText);
      setHindiText(question.hindiText || "");
      setOptions(
        question.options?.map((opt: any) => ({
          sequence: opt.sequence,
          originalText: opt.originalText,
          hindiText: opt.hindiText || "",
          isCorrect: opt.isCorrect,
        })) || []
      );
      setSolutionOriginal(question.solution?.originalText || "");
      setSolutionHindi(question.solution?.hindiText || "");
      setTargetBankId(bankId);
      setTargetSectionId(null);
    }
  }, [open, question, bankId]);

  // KaTeX auto-render helper for math formatting
  useEffect(() => {
    if (open && (window as any).renderMathInElement) {
      const timer = setTimeout(() => {
        (window as any).renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open, targetBankId, mode, options, originalText]);

  // Queries
  const { data: banksResponse, isLoading: isLoadingBanks } = useQuestionBanks({ limit: 100 });
  const { data: targetBankDetailResponse, isLoading: isLoadingTargetBankDetail } = useQuestionBankDetail(targetBankId, 1, 1);

  // Mutations
  const translateMutation = useTranslateQuestions(bankId);
  const copyMutation = useCopyQuestion(bankId);
  const reuseMutation = useReuseQuestion(bankId);

  const questionBanksList = banksResponse?.data || [];
  const targetBankDetail = targetBankDetailResponse?.data;
  const sections = targetBankDetail?.sections || [];
  const isLanguageSubject = targetBankDetail?.subjectType === "LANGUAGE";

  const handleAutoTranslate = async () => {
    const textsToTranslate: string[] = [originalText];
    const optionIndices: number[] = [];

    options.forEach((opt, idx) => {
      textsToTranslate.push(opt.originalText);
      optionIndices.push(idx);
    });

    if (solutionOriginal.trim()) {
      textsToTranslate.push(solutionOriginal);
    }

    try {
      const res = await translateMutation.mutateAsync(textsToTranslate);
      const translations = res.data?.translations || [];

      if (translations.length > 0) {
        setHindiText(translations[0]);

        const updatedOptions = [...options];
        optionIndices.forEach((optIdx, arrayIdx) => {
          updatedOptions[optIdx].hindiText = translations[arrayIdx + 1] || "";
        });
        setOptions(updatedOptions);

        if (solutionOriginal.trim() && translations[translations.length - 1]) {
          setSolutionHindi(translations[translations.length - 1]);
        }

        toast.success("Content translated to Hindi successfully!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to auto-translate content");
    }
  };

  const handleSave = async () => {
    if (!targetBankId) {
      toast.error("Please select a target question bank");
      return;
    }

    if (mode === "copy") {
      if (!originalText.trim()) {
        toast.error("Original question text is required");
        return;
      }

      const copyBody = {
        targetBankId,
        targetSectionId,
        originalText,
        options: options.map((o) => ({
          sequence: o.sequence,
          originalText: o.originalText,
          isCorrect: o.isCorrect,
        })),
        solution: solutionOriginal.trim()
          ? {
              originalText: solutionOriginal,
            }
          : null,
      };

      try {
        await copyMutation.mutateAsync({
          questionId: question.id,
          body: copyBody,
        });
        toast.success("Question duplicated successfully!");
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to copy question");
      }
    } else {
      // Reuse mode
      try {
        await reuseMutation.mutateAsync({
          questionId: question.id,
          body: {
            targetBankId,
            targetSectionId,
          },
        });
        toast.success("Question linked/reused successfully!");
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to link question");
      }
    }
  };

  const typeLabels: Record<string, string> = {
    MCQ_S: "Single Correct MCQ",
    MCQ_M: "Multiple Correct MCQ",
    NUM_U: "Numerical (Exact)",
    NUM_R: "Numerical (Range)",
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end">
      <div
        className="w-full h-full sm:h-[95vh] bg-white dark:bg-slate-955 flex flex-col shadow-2xl overflow-hidden rounded-t-2xl border-t border-slate-200 dark:border-slate-800 transition-all duration-300"
        style={{ paddingBottom: mathLiveVisible ? "280px" : "0px" }}
      >
        {/* Header */}
        <div className="shrink-0 p-4 pb-3 border-b border-slate-100 dark:border-slate-850 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${mode === "copy" ? "bg-emerald-500/10 text-emerald-600" : "bg-indigo-500/10 text-indigo-600"}`}>
              {mode === "copy" ? <Copy className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-foreground capitalize">
                {mode === "copy" ? "Copy Question" : "Reuse Question "}
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {mode === "copy"
                  ? "Creates a completely new copy of this question inside the target bank. You can edit the text."
                  : "Links this existing question to the target bank. Edits to this question will be reflected everywhere."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Panel */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {/* Target bank and section selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-855/85 text-xs">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Target Question Bank</Label>
              {isLoadingBanks ? (
                <div className="h-9 flex items-center justify-center text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Loading question banks...
                </div>
              ) : (
                <select
                  value={targetBankId}
                  onChange={(e) => {
                    setTargetBankId(e.target.value);
                    setTargetSectionId(null);
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:outline-hidden"
                >
                  {questionBanksList.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.title} ({bank.subjectName || "No Subject"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Target Section</Label>
              {isLoadingTargetBankDetail ? (
                <div className="h-9 flex items-center justify-center text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Loading sections...
                </div>
              ) : (
                <select
                  value={targetSectionId || ""}
                  onChange={(e) => setTargetSectionId(e.target.value || null)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium focus:outline-hidden"
                >
                  <option value="">No Section (Unassigned)</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.title} (Seq {sec.sequence})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {mode === "reuse" && targetBankId === bankId && (
              <div className="sm:col-span-2 text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 flex items-center gap-1.5">
                ⚠ Reusing a question in the same bank is not allowed (it is already linked to this bank). Select a different question bank.
              </div>
            )}
          </div>

          {/* Question Type & Marks Read-Only Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs select-none p-3.5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-850 rounded-xl">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground">Type:</span>
              <span className="font-bold text-primary">{typeLabels[question.type] || question.type}</span>
            </div>
            <span className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <span className="text-[10px] font-extrabold uppercase text-muted-foreground">Marking:</span>
              <span className="ml-1 font-semibold">
                +{parseFloat(question.correctMarks)} / -{parseFloat(question.wrongMarks)} Marks
              </span>
            </div>
          </div>

          {/* Editor/Preview Area */}
          <div className="space-y-4">
            {mode === "copy" ? (
              /* COPY MODE: EDITABLE FORM */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Original content column */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-850 pb-1">
                    <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Original Content</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Question Text</Label>
                    <VisualMathTextEditor
                      value={originalText}
                      onChange={setOriginalText}
                      placeholder="Type the question content here..."
                      onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                      fieldId="Question"
                    />
                  </div>

                  {/* Options list (original) */}
                  {(question.type === "MCQ_S" || question.type === "MCQ_M") && (
                    <div className="space-y-3">
                      <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Options List</Label>
                      <div className="space-y-2.5">
                        {options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-2.5 items-center bg-slate-50/50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                            <span className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-muted-foreground">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <div className="flex-1 space-y-1">
                              <VisualMathTextEditor
                                value={opt.originalText}
                                onChange={(val) => {
                                  const updated = [...options];
                                  updated[oIdx].originalText = val;
                                  setOptions(updated);
                                }}
                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}...`}
                                onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                                fieldId={`Option ${String.fromCharCode(65 + oIdx)}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Solution Explanation</Label>
                    <VisualMathTextEditor
                      value={solutionOriginal}
                      onChange={setSolutionOriginal}
                      placeholder="Provide step-by-step resolution steps..."
                      onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                      fieldId="Solution"
                    />
                  </div>
                </div>

                {/* Translated content column */}
                {!isLanguageSubject && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-1">
                      <span className="text-[10px] font-extrabold text-indigo-750 dark:text-indigo-400 uppercase tracking-wider">Translated (Hindi)</span>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">Question Text (Hindi)</Label>
                      <VisualMathTextEditor
                        value={hindiText}
                        onChange={setHindiText}
                        placeholder="हिंदी में प्रश्न दर्ज करें..."
                        onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                        fieldId="Question (HI)"
                      />
                    </div>

                    {/* Options list (Hindi) */}
                    {(question.type === "MCQ_S" || question.type === "MCQ_M") && (
                      <div className="space-y-3">
                        <Label className="text-[9px] font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">Options List (Hindi)</Label>
                        <div className="space-y-2.5">
                          {options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex gap-2.5 items-center bg-indigo-50/10 dark:bg-indigo-955/5 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-950/40">
                              <div className="flex-1 space-y-1">
                                <Label className="text-[9px] font-bold text-indigo-650 dark:text-indigo-400">Option {String.fromCharCode(65 + oIdx)} (Hindi)</Label>
                                <VisualMathTextEditor
                                  value={opt.hindiText}
                                  onChange={(val) => {
                                    const updated = [...options];
                                    updated[oIdx].hindiText = val;
                                    setOptions(updated);
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + oIdx)} (Hindi)...`}
                                  onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                                  fieldId={`Option ${String.fromCharCode(65 + oIdx)} (HI)`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 pt-2">
                      <Label className="text-[9px] font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">Solution Explanation (Hindi)</Label>
                      <VisualMathTextEditor
                        value={solutionHindi}
                        onChange={setSolutionHindi}
                        placeholder="हिंदी में चरण-दर-चरण समाधान..."
                        onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                        fieldId="Solution (HI)"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* REUSE MODE: READ-ONLY PREVIEW */
              <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-900/10 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Question Preview</span>
                </div>

                <div className={question.hindiText ? "grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-850 dark:text-slate-200" : "text-sm text-slate-850 dark:text-slate-200"}>
                  <div className="space-y-2">
                    <div className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">English (Original)</div>
                    <div className="leading-relaxed break-words font-medium text-slate-700 dark:text-slate-300">
                      <MarkdownRenderer text={question.originalText} />
                    </div>
                  </div>
                  {question.hindiText && (
                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                      <div className="font-bold text-[10px] uppercase text-indigo-400 tracking-wider">Hindi (Translation)</div>
                      <div className="leading-relaxed break-words font-medium text-slate-700 dark:text-slate-300">
                        <MarkdownRenderer text={question.hindiText} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Options display */}
                {(question.type === "MCQ_S" || question.type === "MCQ_M") && question.options && (
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Options</div>
                    <div className="space-y-2">
                      {question.options.map((opt: any, idx: number) => (
                        <div
                          key={opt.id || idx}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${
                            opt.isCorrect
                              ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-400"
                              : "border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900"
                          }`}
                        >
                          <span className={`h-5 w-5 shrink-0 flex items-center justify-center rounded-full border text-[10px] font-bold ${
                            opt.isCorrect
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 dark:border-slate-700 text-muted-foreground"
                          }`}>
                            {opt.isCorrect ? <Check className="h-3 w-3" /> : String.fromCharCode(65 + idx)}
                          </span>
                          <div className={opt.hindiText ? "grid grid-cols-1 md:grid-cols-2 gap-4 flex-1" : "flex-1"}>
                            <div className="break-words font-medium leading-relaxed">
                              <MarkdownRenderer text={opt.originalText} />
                            </div>
                            {opt.hindiText && (
                              <div className="break-words font-medium leading-relaxed md:border-l border-slate-200 dark:border-slate-800 md:pl-4 text-slate-500">
                                <MarkdownRenderer text={opt.hindiText} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Solution display */}
                {question.solution && (
                  <div className="p-4 border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg text-xs space-y-2">
                    <div className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Solution Explanation</div>
                    <div className={question.solution.hindiText ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "block"}>
                      <div className="leading-relaxed text-slate-655 dark:text-slate-350">
                        <MarkdownRenderer text={question.solution.originalText} />
                      </div>
                      {question.solution.hindiText && (
                        <div className="leading-relaxed text-slate-500 md:border-l border-slate-200 dark:border-slate-800 md:pl-6">
                          <MarkdownRenderer text={question.solution.hindiText} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Keyboard Panel (For Copy mode) */}
        {mode === "copy" && (
          <div className={`shrink-0 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 pb-6 flex flex-col gap-3 ${keyboardMode === "keyman" ? "block animate-in slide-in-from-bottom duration-200" : "hidden"}`}>
            <div className="flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Keyboard className="h-4 w-4 text-indigo-500" />
                <span>On-Screen Keyboard</span>
                {activeField && (
                  <span className="text-[10px] font-normal text-slate-450 dark:text-slate-500">
                    — {activeField.id}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setKeyboardMode(null)}
                className="h-6 px-3 text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <KeymanOskPanel
              activeField={activeField}
              selectedLocale={keymanLocale}
              onLocaleChange={setKeymanLocale}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="shrink-0 p-4 border-t border-slate-150 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {mode === "copy" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (typeof window !== "undefined" && (window as any).mathVirtualKeyboard) {
                    (window as any).mathVirtualKeyboard.hide();
                  }
                  setKeyboardMode((prev) => (prev === "keyman" ? null : "keyman"));
                }}
                className={`h-8.5 px-3 font-bold text-[11px] gap-1.5 rounded-lg border transition-all ${
                  keyboardMode === "keyman"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                    : "bg-white hover:bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                }`}
              >
                <Keyboard className="h-3.5 w-3.5" />
                Keyboard
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {mode === "copy" && !isLanguageSubject && (
              <Button
                type="button"
                onClick={handleAutoTranslate}
                disabled={translateMutation.isPending}
                className="h-8.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1 text-[11px] rounded-lg shadow-sm"
              >
                {translateMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                )}
                Translate & Preview
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-8.5 text-[11px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={
                copyMutation.isPending ||
                reuseMutation.isPending ||
                (mode === "reuse" && targetBankId === bankId)
              }
              className="h-8.5 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px] shadow-sm"
            >
              {(copyMutation.isPending || reuseMutation.isPending) && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              {mode === "copy" ? "Save Copy" : "Link Question"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
