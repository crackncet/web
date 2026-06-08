"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Upload,
  Loader2,
  AlertTriangle,
  Trash2,
  Download,
  Keyboard,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  usePreviewQuestions,
  usePreviewStatus,
  useUploadQuestions,
} from "../_queries/question-banks.queries";
import { toast } from "sonner";
import { QuestionItemRow } from "./question-item-row";
import { KeymanOskPanel } from "./virtual-keyboard";
import { VisualMathTextEditor } from "./visual-math-text-editor";

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

interface BulkQuestionInput {
  type: "MCQ_S" | "MCQ_M" | "NUM_U" | "NUM_R";
  correctMarks: string;
  wrongMarks: string;
  partialMarks: string;
  originalText: string;
  options: { sequence: number; originalText: string; isCorrect: boolean }[];
  numExact: string;
  numMin: string;
  numMax: string;
  solutionOriginal: string;
}

interface BatchUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankId: string;
  onSuccess?: () => void;
}

export function BatchUploadDialog({
  open,
  onOpenChange,
  bankId,
  onSuccess,
}: BatchUploadDialogProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);

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

  // Keyboard panel state
  const [keyboardMode, setKeyboardMode] = useState<"keyman" | null>(null);
  const [keymanLocale, setKeymanLocale] = useState("@hi");
  const [mathLiveVisible, setMathLiveVisible] = useState(false);
  const [activeField, setActiveField] = useState<{
    id: string;
    ref: HTMLTextAreaElement | HTMLInputElement | null;
  } | null>(null);

  // Track MathLive keyboard visibility
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mvk = (window as any).mathVirtualKeyboard;
    if (!mvk) return;
    const handler = () => setMathLiveVisible(!!mvk.visible);
    mvk.addEventListener("geometrychange", handler);
    return () => mvk.removeEventListener("geometrychange", handler);
  }, [open]);

  // Close keyboard panel when dialog closes
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

  const [bulkTab, setBulkTab] = useState<"file" | "builder">("file");
  const [builderQuestions, setBuilderQuestions] = useState<BulkQuestionInput[]>([
    {
      type: "MCQ_S",
      correctMarks: "4.00",
      wrongMarks: "1.00",
      partialMarks: "",
      originalText: "",
      options: [
        { sequence: 0, originalText: "", isCorrect: false },
        { sequence: 1, originalText: "", isCorrect: false },
        { sequence: 2, originalText: "", isCorrect: false },
        { sequence: 3, originalText: "", isCorrect: false },
      ],
      numExact: "",
      numMin: "",
      numMax: "",
      solutionOriginal: "",
    },
  ]);

  // Mutations
  const previewMutation = usePreviewQuestions(bankId);
  const uploadMutation = useUploadQuestions(bankId);

  // Poll job status
  const { data: pollResponse } = usePreviewStatus(bankId, jobId || "", isPolling);
  const previewJob = pollResponse?.data;

  // Check if job completed or failed to stop polling
  useEffect(() => {
    if (previewJob?.status === "completed" || previewJob?.status === "failed") {
      setIsPolling(false);
      if (previewJob?.status === "completed" && previewJob?.data?.questions) {
        setPreviewQuestions(previewJob.data.questions);
      }
    }
  }, [previewJob]);

  // Activate KaTeX auto rendering whenever questions change
  const katexDependency = `${(previewQuestions || []).map((_, i) => i).join(",")}`;
  useKaTeX(katexDependency);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setJobId(null);
      setIsPolling(false);
    }
  };

  const handleStartPreview = async () => {
    if (!uploadFile) {
      toast.error("Please select a markdown file first");
      return;
    }

    try {
      const res = await previewMutation.mutateAsync(uploadFile);
      if (res.data?.jobId) {
        setJobId(res.data.jobId);
        setIsPolling(true);
      } else {
        toast.error("Failed to enqueue preview job");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start preview job");
    }
  };

  const handleCommitUpload = async () => {
    if (!previewQuestions || previewQuestions.length === 0) {
      toast.error("No parsed questions found to upload");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        questions: previewQuestions,
      });
      toast.success("Questions uploaded successfully!");
      onOpenChange(false);
      setUploadFile(null);
      setJobId(null);
      setPreviewQuestions([]);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save questions");
    }
  };

  const handleAddBuilderQuestion = () => {
    setBuilderQuestions((prev) => [
      ...prev,
      {
        type: "MCQ_S",
        correctMarks: "4.00",
        wrongMarks: "1.00",
        partialMarks: "",
        originalText: "",
        options: [
          { sequence: 0, originalText: "", isCorrect: false },
          { sequence: 1, originalText: "", isCorrect: false },
          { sequence: 2, originalText: "", isCorrect: false },
          { sequence: 3, originalText: "", isCorrect: false },
        ],
        numExact: "",
        numMin: "",
        numMax: "",
        solutionOriginal: "",
      },
    ]);
  };

  const handleRemoveBuilderQuestion = (index: number) => {
    setBuilderQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBuilderQuestion = (index: number, fields: Partial<BulkQuestionInput>) => {
    setBuilderQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...fields } : q))
    );
  };

  const handleUpdateBuilderOption = (questionIndex: number, optionIndex: number, text: string) => {
    setBuilderQuestions((prev) =>
      prev.map((q, qIdx) => {
        if (qIdx !== questionIndex) return q;
        const newOptions = q.options.map((opt, oIdx) =>
          oIdx === optionIndex ? { ...opt, originalText: text } : opt
        );
        return { ...q, options: newOptions };
      })
    );
  };

  const handleToggleBuilderOptionCorrect = (questionIndex: number, optionIndex: number, isChecked: boolean) => {
    setBuilderQuestions((prev) =>
      prev.map((q, qIdx) => {
        if (qIdx !== questionIndex) return q;
        const newOptions = q.options.map((opt, oIdx) => {
          if (q.type === "MCQ_S") {
            return { ...opt, isCorrect: oIdx === optionIndex ? isChecked : false };
          } else {
            return oIdx === optionIndex ? { ...opt, isCorrect: isChecked } : opt;
          }
        });
        return { ...q, options: newOptions };
      })
    );
  };

  const generateBulkMarkdown = (questions: BulkQuestionInput[]): string => {
    return questions.map((q) => {
      let yamlLines = [
        `type: ${q.type}`,
        `correct_marks: ${q.correctMarks || "4.00"}`,
        `wrong_marks: ${q.wrongMarks || "1.00"}`,
      ];
      if (q.type === "MCQ_M" && q.partialMarks) {
        yamlLines.push(`partial_marks: ${q.partialMarks}`);
      }

      if (q.type === "MCQ_S") {
        const correctOpt = q.options.find((o) => o.isCorrect);
        const letter = correctOpt ? String.fromCharCode(65 + correctOpt.sequence) : "A";
        yamlLines.push(`correct_option: ${letter}`);
      } else if (q.type === "MCQ_M") {
        yamlLines.push("correct_options:");
        q.options.forEach((o) => {
          if (o.isCorrect) {
            yamlLines.push(`  - ${String.fromCharCode(65 + o.sequence)}`);
          }
        });
      } else if (q.type === "NUM_U") {
        yamlLines.push(`num_exact: ${q.numExact || "0"}`);
      } else if (q.type === "NUM_R") {
        yamlLines.push(`num_min: ${q.numMin || "0"}`);
        yamlLines.push(`num_max: ${q.numMax || "0"}`);
      }

      const frontmatter = `---\n${yamlLines.join("\n")}\n---`;
      let body = q.originalText;

      if (q.type === "MCQ_S" || q.type === "MCQ_M") {
        const optionsBlock = q.options
          .map((o) => `${String.fromCharCode(65 + o.sequence)}) ${o.originalText}`)
          .join("\n\n");
        body = `${body}\n\n${optionsBlock}`;
      }

      if (q.solutionOriginal?.trim()) {
        body = `${body}\n\n### Solution\n${q.solutionOriginal.trim()}`;
      }

      return `${frontmatter}\n${body}`;
    }).join("\n\n===QUESTION_BOUNDARY===\n\n");
  };

  const handleDownloadMarkdown = (questions: BulkQuestionInput[]) => {
    const mdContent = generateBulkMarkdown(questions);
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `question_bank_bulk_${bankId}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseBuilderQuestions = async (questions: BulkQuestionInput[]) => {
    const mdContent = generateBulkMarkdown(questions);
    const file = new File([mdContent], "bulk-questions-builder.md", { type: "text/markdown" });

    try {
      const res = await previewMutation.mutateAsync(file);
      if (res.data?.jobId) {
        setJobId(res.data.jobId);
        setIsPolling(true);
      } else {
        toast.error("Failed to enqueue preview job");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start preview job");
    }
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end">
      <div 
        className="w-full h-full sm:h-[95vh] bg-white dark:bg-slate-900 flex flex-col shadow-2xl overflow-hidden rounded-t-2xl border-t border-slate-200 dark:border-slate-800 transition-all duration-300"
        style={{ paddingBottom: mathLiveVisible ? "280px" : "0px" }}
      >
        {/* Header */}
        <div className="shrink-0 p-4 pb-3 border-b border-slate-100 dark:border-slate-850 flex flex-row items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-foreground">
              Batch Question Creator & Uploader
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Create questions visually or upload a structured Markdown file to bulk import into the bank. Use physical or virtual keyboards.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => {
              onOpenChange(false);
              setUploadFile(null);
              setJobId(null);
              setIsPolling(false);
              setPreviewQuestions([]);
            }}
            className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-slate-150 dark:border-slate-800/80 pb-2 mt-2 shrink-0 select-none">
          <button
            type="button"
            onClick={() => setBulkTab("file")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              bulkTab === "file"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Upload Markdown File (.md)
          </button>
          <button
            type="button"
            onClick={() => setBulkTab("builder")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              bulkTab === "builder"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Visual Bulk Builder
          </button>
        </div>

        {/* Dialog Body */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-4 pr-1">
          {bulkTab === "file" ? (
            <div className="space-y-4">
              {/* File Picker & Action Bar */}
              <div className="flex flex-col sm:flex-row items-end gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="flex-1 space-y-1.5 w-full">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Select Markdown File
                  </Label>
                  <Input
                    type="file"
                    accept=".md"
                    onChange={handleFileChange}
                    className="h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                <Button
                  onClick={handleStartPreview}
                  disabled={!uploadFile || previewMutation.isPending || isPolling}
                  className="h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-lg px-4 shrink-0 w-full sm:w-auto cursor-pointer"
                >
                  {previewMutation.isPending || isPolling ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Parse & Preview
                    </>
                  )}
                </Button>
              </div>

              {/* MD Prompt Template instructions for LLM */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/60 dark:border-indigo-900/40 rounded-xl gap-3 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Need the structured Markdown template?</h4>
                  <p className="text-muted-foreground text-[11px]">
                    Download our standard prompt template file containing exact structures for MCQ, MCQ_M, NUM_U, and NUM_R to feed directly into any LLM.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="h-8.5 text-[11px] font-bold shrink-0 bg-white dark:bg-slate-900 border-indigo-150 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50"
                >
                  <a href="/question_bank_template.md" download="question_bank_template.md">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download Template
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-xs font-medium text-muted-foreground">
                  Compose bulk questions visually. We'll generate the correct markdown syntax automatically.
                </span>
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDownloadMarkdown(builderQuestions)}
                    disabled={builderQuestions.length === 0}
                    className="h-8 text-[11px] font-bold px-3 gap-1 hover:bg-muted/10 border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer bg-white dark:bg-slate-900"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download .md File
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleParseBuilderQuestions(builderQuestions)}
                    disabled={builderQuestions.length === 0 || previewMutation.isPending || isPolling}
                    className="h-8 text-[11px] font-bold bg-primary hover:bg-primary/90 text-white rounded-lg px-3 cursor-pointer"
                  >
                    {previewMutation.isPending || isPolling ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Parse & Preview
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {builderQuestions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-500/5 dark:bg-slate-900/20 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-2">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Question #{qIdx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveBuilderQuestion(qIdx)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Type
                        </Label>
                        <select
                          value={q.type}
                          onChange={(e) => {
                            const newType = e.target.value as any;
                            handleUpdateBuilderQuestion(qIdx, {
                              type: newType,
                              options: (newType === "MCQ_S" || newType === "MCQ_M")
                                ? [
                                    { sequence: 0, originalText: "", isCorrect: false },
                                    { sequence: 1, originalText: "", isCorrect: false },
                                    { sequence: 2, originalText: "", isCorrect: false },
                                    { sequence: 3, originalText: "", isCorrect: false },
                                  ]
                                : [],
                            });
                          }}
                          className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-hidden"
                        >
                          <option value="MCQ_S">Single Correct MCQ</option>
                          <option value="MCQ_M">Multiple Correct MCQ</option>
                          <option value="NUM_U">Numerical (Exact)</option>
                          <option value="NUM_R">Numerical (Range)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Correct Marks
                        </Label>
                        <Input
                          type="text"
                          value={q.correctMarks}
                          onChange={(e) => handleUpdateBuilderQuestion(qIdx, { correctMarks: e.target.value })}
                          className="h-8 text-xs bg-white dark:bg-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Negative Marks
                        </Label>
                        <Input
                          type="text"
                          value={q.wrongMarks}
                          onChange={(e) => handleUpdateBuilderQuestion(qIdx, { wrongMarks: e.target.value })}
                          className="h-8 text-xs bg-white dark:bg-slate-900"
                        />
                      </div>

                      {q.type === "MCQ_M" && (
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Partial Marks
                          </Label>
                          <Input
                            type="text"
                            value={q.partialMarks}
                            onChange={(e) => handleUpdateBuilderQuestion(qIdx, { partialMarks: e.target.value })}
                            className="h-8 text-xs bg-white dark:bg-slate-900"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Question Text
                      </Label>
                      <VisualMathTextEditor
                        value={q.originalText}
                        onChange={(val) => handleUpdateBuilderQuestion(qIdx, { originalText: val })}
                        placeholder="Type original question text (supports LaTeX like $f: \mathbb{R} \to \mathbb{R}$)"
                        onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                        fieldId={`Question #${qIdx + 1} Text`}
                      />
                    </div>

                    {/* Options editing for MCQ */}
                    {(q.type === "MCQ_S" || q.type === "MCQ_M") && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Options
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                            >
                              <div className="flex flex-col items-center shrink-0 pt-2 select-none">
                                <input
                                  type={q.type === "MCQ_S" ? "radio" : "checkbox"}
                                  name={`correct-${qIdx}`}
                                  checked={opt.isCorrect}
                                  onChange={(e) => handleToggleBuilderOptionCorrect(qIdx, oIdx, e.target.checked)}
                                  className="h-4 w-4 text-primary focus:ring-primary border-slate-350 dark:border-slate-750 rounded-sm cursor-pointer"
                                />
                                <span className="text-[9px] font-extrabold text-slate-450 mt-1.5">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <VisualMathTextEditor
                                  value={opt.originalText}
                                  onChange={(val) => handleUpdateBuilderOption(qIdx, oIdx, val)}
                                  placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                  onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                                  fieldId={`Question #${qIdx + 1} Option ${String.fromCharCode(65 + oIdx)}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Numerical Exact value inputs */}
                    {q.type === "NUM_U" && (
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Correct Exact Value
                        </Label>
                        <Input
                          type="text"
                          value={q.numExact}
                          onChange={(e) => handleUpdateBuilderQuestion(qIdx, { numExact: e.target.value })}
                          placeholder="e.g. 5.0"
                          className="h-8 text-xs bg-white dark:bg-slate-900 max-w-[200px]"
                        />
                      </div>
                    )}

                    {/* Numerical Range value inputs */}
                    {q.type === "NUM_R" && (
                      <div className="grid grid-cols-2 gap-4 max-w-[400px]">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Minimum Value (Min)
                          </Label>
                          <Input
                            type="text"
                            value={q.numMin}
                            onChange={(e) => handleUpdateBuilderQuestion(qIdx, { numMin: e.target.value })}
                            placeholder="e.g. 3.14"
                            className="h-8 text-xs bg-white dark:bg-slate-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Maximum Value (Max)
                          </Label>
                          <Input
                            type="text"
                            value={q.numMax}
                            onChange={(e) => handleUpdateBuilderQuestion(qIdx, { numMax: e.target.value })}
                            placeholder="e.g. 3.15"
                            className="h-8 text-xs bg-white dark:bg-slate-900"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Solution Explanation
                      </Label>
                      <VisualMathTextEditor
                        value={q.solutionOriginal}
                        onChange={(val) => handleUpdateBuilderQuestion(qIdx, { solutionOriginal: val })}
                        placeholder="Type step-by-step solution text (optional)"
                        onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
                        fieldId={`Question #${qIdx + 1} Solution`}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddBuilderQuestion}
                  className="w-full py-4 text-xs font-bold border-dashed border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Question
                </Button>
              </div>
            </div>
          )}

          {/* Parsing / Polling status */}
          {isPolling && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                Processing questions inside queues...
              </p>
              <p className="text-[10px] text-muted-foreground text-center max-w-sm">
                Formatting inputs, isolating equation contexts, and translating via Google Translate.
              </p>
            </div>
          )}

          {/* Error or Fail states */}
          {previewJob?.status === "failed" && (
            <div className="flex gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold">Parser Job Failed</h4>
                <p className="text-[11px] leading-relaxed">
                  {previewJob.failedReason || "An error occurred during Markdown processing. Check syntax formatting."}
                </p>
              </div>
            </div>
          )}

          {/* Preview Output */}
          {previewJob?.status === "completed" && previewJob?.data && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Compiler Warnings */}
              {previewJob.data.errors && previewJob.data.errors.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/60 p-4 rounded-xl text-amber-800 dark:text-amber-300 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs font-bold">Parsing Warnings ({previewJob.data.errors.length})</h4>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] space-y-1 leading-relaxed">
                    {previewJob.data.errors.map((err: any, i: number) => (
                      <li key={i}>
                        {err.index >= 0 ? `Question ${err.index + 1}: ` : ""}
                        {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parsed List with identical user layout */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-950 shadow-xs">
                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 select-none">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Parsed Questions Preview ({previewQuestions.length})
                  </h4>
                </div>
                <div className="divide-y divide-slate-150 dark:divide-slate-850 px-6 max-h-[50vh] overflow-y-auto">
                  {previewQuestions.map((q: any, i: number) => (
                    <QuestionItemRow
                      key={i}
                      question={q}
                      index={i + 1}
                      onUpdateInMemory={(updatedQ) => {
                        setPreviewQuestions((prev) =>
                          prev.map((item, idx) => (idx === i ? updatedQ : item))
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
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
        <div className="shrink-0 p-4 border-t border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
          <div className="flex items-center gap-1.5">
            {bulkTab === "builder" && (
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                setUploadFile(null);
                setJobId(null);
                setIsPolling(false);
                setPreviewQuestions([]);
              }}
              className="h-8.5 text-[11px] font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500"
            >
              Close
            </Button>
            <Button
              onClick={handleCommitUpload}
              disabled={previewQuestions.length === 0 || uploadMutation.isPending}
              className="h-8.5 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px] shadow-sm cursor-pointer"
            >
              {uploadMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              Confirm & Save
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
