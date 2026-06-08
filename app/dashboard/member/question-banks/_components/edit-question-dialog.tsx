"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, Keyboard, Languages, Loader2, Sparkles, Sigma, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateQuestion, useTranslateQuestions, useUploadQuestions, useQuestionBankDetail } from "../_queries/question-banks.queries";
import { toast } from "sonner";
import { KeymanOskPanel } from "./virtual-keyboard";
import { PreviewQuestionDialog } from "./preview-question-dialog";
import { VisualMathTextEditor } from "./visual-math-text-editor";

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: any;
  index?: number;
  bankId: string;
  onUpdateInMemory?: (updatedQuestion: any) => void;
}

export function EditQuestionDialog({
  open,
  onOpenChange,
  question,
  index = 1,
  bankId,
  onUpdateInMemory,
}: EditQuestionDialogProps) {
  // Edit form state
  const [editType, setEditType] = useState(question?.type || "MCQ_S");
  const [originalText, setOriginalText] = useState(question?.originalText || "");
  const [hindiText, setHindiText] = useState(question?.hindiText || "");
  const [correctMarks, setCorrectMarks] = useState(question?.correctMarks || "4.00");
  const [wrongMarks, setWrongMarks] = useState(question?.wrongMarks || "1.00");
  const [partialMarks, setPartialMarks] = useState(question?.partialMarks || "");
  const [numExact, setNumExact] = useState(question?.numExact || "");
  const [numMin, setNumMin] = useState(question?.numMin || "");
  const [numMax, setNumMax] = useState(question?.numMax || "");
  const [options, setOptions] = useState<any[]>([]);
  const [solutionOriginal, setSolutionOriginal] = useState(question?.solution?.originalText || "");
  const [solutionHindi, setSolutionHindi] = useState(question?.solution?.hindiText || "");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(question?.sectionId || null);

  // Keyboard panel state
  const [keyboardMode, setKeyboardMode] = useState<"keyman" | null>(null);
  const [keymanLocale, setKeymanLocale] = useState("@hi");
  const [mathLiveVisible, setMathLiveVisible] = useState(false);
  const [activeField, setActiveField] = useState<{
    id: string;
    ref: HTMLTextAreaElement | HTMLInputElement | null;
  } | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
        try { (window as any).mathVirtualKeyboard.hide(); } catch (e) {}
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

  // Sync form values
  useEffect(() => {
    if (open) {
      if (question) {
        setEditType(question.type);
        setOriginalText(question.originalText);
        setHindiText(question.hindiText || "");
        setCorrectMarks(question.correctMarks || "4.00");
        setWrongMarks(question.wrongMarks || "1.00");
        setPartialMarks(question.partialMarks || "");
        setNumExact(question.numExact || "");
        setNumMin(question.numMin || "");
        setNumMax(question.numMax || "");
        setOptions(
          question.options?.map((opt: any) => ({
            id: opt.id,
            sequence: opt.sequence,
            originalText: opt.originalText,
            hindiText: opt.hindiText || "",
            isCorrect: opt.isCorrect,
          })) || []
        );
        setSolutionOriginal(question.solution?.originalText || "");
        setSolutionHindi(question.solution?.hindiText || "");
        setSelectedSectionId(question.sectionId || null);
      } else {
        setEditType("MCQ_S");
        setOriginalText("");
        setHindiText("");
        setCorrectMarks("4.00");
        setWrongMarks("1.00");
        setPartialMarks("");
        setNumExact("");
        setNumMin("");
        setNumMax("");
        setOptions([
          { sequence: 1, originalText: "", hindiText: "", isCorrect: false },
          { sequence: 2, originalText: "", hindiText: "", isCorrect: false },
          { sequence: 3, originalText: "", hindiText: "", isCorrect: false },
          { sequence: 4, originalText: "", hindiText: "", isCorrect: false },
        ]);
        setSolutionOriginal("");
        setSolutionHindi("");
        setSelectedSectionId(null);
      }
    }
  }, [open, question]);

  // Translate logic
  const translateMutation = useTranslateQuestions(bankId);
  const updateMutation = useUpdateQuestion(bankId);
  const uploadMutation = useUploadQuestions(bankId);

  const { data: bankDetailResponse } = useQuestionBankDetail(bankId);
  const isLanguageSubject = bankDetailResponse?.data?.subjectType === "LANGUAGE";
  const sections = bankDetailResponse?.data?.sections || [];

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
        setPreviewOpen(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to auto-translate content");
    }
  };

  const handleSave = async () => {
    if (!originalText.trim()) {
      toast.error("Original text is required");
      return;
    }

    const saveBody: any = {
      type: editType,
      sectionId: selectedSectionId || null,
      correctMarks,
      wrongMarks,
      partialMarks: editType === "MCQ_M" ? partialMarks || null : null,
      originalText,
      hindiText: hindiText.trim() || null,
      options: (editType === "MCQ_S" || editType === "MCQ_M")
        ? options.map((o) => ({
            ...(o.id ? { id: o.id } : {}),
            sequence: o.sequence,
            originalText: o.originalText,
            hindiText: o.hindiText?.trim() || null,
            isCorrect: o.isCorrect,
          }))
        : [],
      solution: solutionOriginal.trim()
        ? {
            originalText: solutionOriginal,
            hindiText: solutionHindi.trim() || null,
          }
        : null,
      numExact: editType === "NUM_U" ? numExact || null : null,
      numMin: editType === "NUM_R" ? numMin || null : null,
      numMax: editType === "NUM_R" ? numMax || null : null,
    };

    if (!question) {
      // Create Mode
      try {
        await uploadMutation.mutateAsync({
          questions: [saveBody],
        });
        toast.success("Question created successfully!");
        setPreviewOpen(false);
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to create question");
      }
    } else {
      // Edit Mode
      if (bankId || !onUpdateInMemory) {
        try {
          await updateMutation.mutateAsync({
            questionId: question.id,
            body: saveBody,
          });
          toast.success("Question updated successfully!");
          setPreviewOpen(false);
          onOpenChange(false);
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Failed to update question");
        }
      } else if (onUpdateInMemory) {
        onUpdateInMemory({
          ...question,
          ...saveBody,
        });
        toast.success("Question updated in memory!");
        setPreviewOpen(false);
        onOpenChange(false);
      }
    }
  };

  const handleOptionCorrectChange = (sequence: number, isChecked: boolean) => {
    if (editType === "MCQ_S") {
      setOptions(
        options.map((opt) => ({
          ...opt,
          isCorrect: opt.sequence === sequence,
        }))
      );
    } else {
      setOptions(
        options.map((opt) =>
          opt.sequence === sequence ? { ...opt, isCorrect: isChecked } : opt
        )
      );
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
          <div>
            <h2 className="text-sm font-extrabold text-foreground">
              Workspace Editor: {question ? `Edit Question #${index}` : "Create Question"}
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {question ? "Edit original and translated content side-by-side." : "Write original content, translate, and verify before saving."} Use physical or virtual keyboards.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Workspace panel */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          
          {/* Config row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-855/85 text-xs">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Question Type</Label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-hidden"
              >
                <option value="MCQ_S">Single Correct MCQ</option>
                <option value="MCQ_M">Multiple Correct MCQ</option>
                <option value="NUM_U">Numerical (Exact)</option>
                <option value="NUM_R">Numerical (Range)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Section</Label>
              <select
                value={selectedSectionId || ""}
                onChange={(e) => setSelectedSectionId(e.target.value || null)}
                className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-hidden"
              >
                <option value="">No Section</option>
                {sections.map((sec: any) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Correct Marks</Label>
              <Input
                type="text"
                value={correctMarks}
                onChange={(e) => setCorrectMarks(e.target.value)}
                className="h-8 text-xs px-2"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Negative Marks</Label>
              <Input
                type="text"
                value={wrongMarks}
                onChange={(e) => setWrongMarks(e.target.value)}
                className="h-8 text-xs px-2"
              />
            </div>

            {editType === "MCQ_M" && (
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Partial Marks</Label>
                <Input
                  type="text"
                  value={partialMarks}
                  onChange={(e) => setPartialMarks(e.target.value)}
                  className="h-8 text-xs px-2"
                />
              </div>
            )}
          </div>

          {/* Two column split */}
          <div className={`grid grid-cols-1 ${isLanguageSubject ? "" : "md:grid-cols-2"} gap-5 items-start`}>
            
            {/* Left Col: Original */}
            <div className={`space-y-4 ${isLanguageSubject ? "" : "border-r border-slate-100 dark:border-slate-850/60 pr-1 md:pr-4"}`}>
              <div className="border-b border-slate-100 dark:border-slate-850 pb-1">
                <span className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Original Text</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Question Text</Label>
                <VisualMathTextEditor
                  value={originalText}
                  onChange={setOriginalText}
                  placeholder="Enter original question content in English..."
                  onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                  fieldId="Question (EN)"
                />
              </div>

              {/* Options list */}
              {(editType === "MCQ_S" || editType === "MCQ_M") && (
                <div className="space-y-3">
                  <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Options List</Label>
                  <div className="space-y-2.5">
                    {options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex gap-2.5 items-center bg-slate-50/50 dark:bg-slate-955/20 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850/60">
                        <div className="flex flex-col items-center shrink-0">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Correct</span>
                          <input
                            type={editType === "MCQ_S" ? "radio" : "checkbox"}
                            name={`isCorrect-${index}`}
                            checked={opt.isCorrect}
                            onChange={(e) => handleOptionCorrectChange(opt.sequence, e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label className="text-[9px] font-bold text-muted-foreground">Option {String.fromCharCode(65 + oIdx)}</Label>
                          <VisualMathTextEditor
                            value={opt.originalText}
                            onChange={(val) => {
                              const updated = [...options];
                              updated[oIdx].originalText = val;
                              setOptions(updated);
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)} English...`}
                            onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                            fieldId={`Option ${String.fromCharCode(65 + oIdx)} (EN)`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Numerical Options */}
              {editType === "NUM_U" && (
                <div className="space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Exact Numerical Answer</Label>
                  <Input
                    type="text"
                    value={numExact}
                    onChange={(e) => setNumExact(e.target.value)}
                    placeholder="e.g. 5.40"
                    className="h-8 text-xs max-w-xs"
                  />
                </div>
              )}

              {editType === "NUM_R" && (
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Minimum Range Value</Label>
                    <Input
                      type="text"
                      value={numMin}
                      onChange={(e) => setNumMin(e.target.value)}
                      placeholder="e.g. 5.30"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Maximum Range Value</Label>
                    <Input
                      type="text"
                      value={numMax}
                      onChange={(e) => setNumMax(e.target.value)}
                      placeholder="e.g. 5.50"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Solution Explanation (Original)</Label>
                <VisualMathTextEditor
                  value={solutionOriginal}
                  onChange={setSolutionOriginal}
                  placeholder="Provide step-by-step resolution steps..."
                  onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                  fieldId="Solution (EN)"
                />
              </div>
            </div>

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
                {(editType === "MCQ_S" || editType === "MCQ_M") && (
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
        </div>

        {/* Integrated OSK Panel (Keyman) */}
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

        {/* Footer actions */}
        <div className="shrink-0 p-4 border-t border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {/* Keyman Language OSK Trigger */}
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
          </div>

          <div className="flex items-center gap-2">
            {!isLanguageSubject && (
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
              disabled={question ? updateMutation.isPending : uploadMutation.isPending}
              className="h-8.5 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px] shadow-sm"
            >
              {(question ? updateMutation.isPending : uploadMutation.isPending) && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              {question ? "Save Changes" : "Create Question"}
            </Button>
          </div>
        </div>

      </div>

      {/* Live Preview Modal Overlay */}
      {previewOpen && (
        <PreviewQuestionDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          index={index}
          type={editType}
          typeLabel={typeLabels[editType] || editType}
          correctMarks={correctMarks}
          wrongMarks={wrongMarks}
          partialMarks={partialMarks}
          originalText={originalText}
          hindiText={hindiText}
          options={options}
          solutionOriginal={solutionOriginal}
          solutionHindi={solutionHindi}
          numExact={numExact}
          numMin={numMin}
          numMax={numMax}
          onConfirmSave={handleSave}
          isSaving={question ? updateMutation.isPending : uploadMutation.isPending}
        />
      )}
    </div>,
    document.body
  );
}
