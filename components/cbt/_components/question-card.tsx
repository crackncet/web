"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, X, HelpCircle, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PracticeQuestion, PracticeOption } from "@/app/dashboard/student/my-courses/[courseId]/subjects/[courseSubjectId]/topics/[topicId]/practice/_api/practice.api";

interface QuestionCardProps {
  question: PracticeQuestion;
  questionNumber: number;
  selectedOptionIds?: string[];
  numericAnswer?: string | null;
  onChangeResponse?: (selectedIds: string[], numValue: string | null) => void;
  onClearResponse?: () => void;
  isReportMode?: boolean;
  evaluatedResponse?: {
    selectedOptionIds: string[];
    numericAnswer: string | null;
    isCorrect: boolean | null;
    isPartiallyCorrect: boolean;
    marksAwarded: string;
  } | null;
  className?: string;
}

export function QuestionCard({
  question,
  questionNumber,
  selectedOptionIds = [],
  numericAnswer = "",
  onChangeResponse,
  onClearResponse,
  isReportMode = false,
  evaluatedResponse = null,
  className,
}: QuestionCardProps) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [mobileShowOptions, setMobileShowOptions] = useState(false);
  const [mathReady, setMathReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasHindi = !!(question.hindiText || question.hindiImage);

  // Set mathReady to false whenever question or language changes to render skeleton
  useEffect(() => {
    setMathReady(false);
  }, [question.id, lang]);

  // KaTeX loader and rendering hook
  useEffect(() => {
    let active = true;

    const loadAndRender = () => {
      if (!active) return;
      
      const render = () => {
        if (!containerRef.current) return;
        try {
          if ((window as any).renderMathInElement) {
            (window as any).renderMathInElement(containerRef.current, {
              delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
              ],
            });
          }
        } catch (err) {
          console.error("KaTeX rendering error:", err);
        } finally {
          // Delay transition slightly to avoid flash of raw text
          setTimeout(() => {
            if (active) setMathReady(true);
          }, 80);
        }
      };

      // Ensure CSS exists
      if (!document.getElementById("katex-css")) {
        const link = document.createElement("link");
        link.id = "katex-css";
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
        document.head.appendChild(link);
      }

      // Ensure JS exists
      if (!(window as any).katex) {
        if (!document.getElementById("katex-js")) {
          const script = document.createElement("script");
          script.id = "katex-js";
          script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
          script.onload = () => {
            if (!document.getElementById("katex-auto-render-js")) {
              const autoScript = document.createElement("script");
              autoScript.id = "katex-auto-render-js";
              autoScript.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js";
              autoScript.onload = render;
              document.head.appendChild(autoScript);
            } else {
              render();
            }
          };
          document.head.appendChild(script);
        }
      } else {
        render();
      }
    };

    loadAndRender();

    return () => {
      active = false;
    };
  }, [question.id, lang, mathReady]);

  // Determine text and image based on active language
  const questionText = lang === "hi" && question.hindiText ? question.hindiText : question.originalText;
  const questionImage = lang === "hi" && question.hindiImage ? question.hindiImage : question.originalImage;

  const handleOptionSelect = (optionId: string) => {
    if (isReportMode || !onChangeResponse) return;

    if (question.type === "MCQ_S") {
      onChangeResponse([optionId], null);
    } else if (question.type === "MCQ_M") {
      const isSelected = selectedOptionIds.includes(optionId);
      const newSelected = isSelected
        ? selectedOptionIds.filter((id) => id !== optionId)
        : [...selectedOptionIds, optionId];
      onChangeResponse(newSelected, null);
    }
  };

  const handleNumericChange = (val: string) => {
    if (isReportMode || !onChangeResponse) return;
    onChangeResponse([], val === "" ? null : val);
  };

  // Helper to retrieve option text/image in correct language
  const getOptionText = (opt: PracticeOption) => {
    return lang === "hi" && opt.hindiText ? opt.hindiText : opt.originalText;
  };

  const getOptionImage = (opt: PracticeOption) => {
    return lang === "hi" && opt.hindiImage ? opt.hindiImage : opt.originalImage;
  };

  // Helper to determine option background colors and indicators in report mode
  const getOptionStyle = (optionId: string) => {
    const opt = question.options.find((o) => o.id === optionId);
    if (!isReportMode) {
      const isSelected = selectedOptionIds.includes(optionId);
      return cn(
        "border border-border rounded-xl p-4 transition-all flex items-center gap-3 cursor-pointer select-none min-h-[48px]",
        isSelected ? "bg-primary/5 border-primary text-foreground ring-1 ring-primary" : "bg-card hover:bg-muted/40"
      );
    }

    // Report mode styling
    const userSelected = (evaluatedResponse?.selectedOptionIds || []).includes(optionId);
    const isCorrectOption = opt?.isCorrect ?? false; // Backed evaluated option flag

    if (isCorrectOption) {
      return "border border-emerald-500 bg-emerald-500/10 text-foreground rounded-xl p-4 flex items-center gap-3 min-h-[48px] select-none";
    }

    if (userSelected && !isCorrectOption) {
      return "border border-rose-500 bg-rose-500/10 text-foreground rounded-xl p-4 flex items-center gap-3 min-h-[48px] select-none";
    }

    return "border border-border bg-card opacity-85 rounded-xl p-4 flex items-center gap-3 min-h-[48px] select-none";
  };

  // Match option loop reference
  const sortedOptions = [...question.options].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className={cn("space-y-6 flex flex-col h-full bg-background text-foreground", className)}>
      {/* Top Header details inside Card */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Question {questionNumber}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {question.type.replace("_", " ")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Marking scheme chip */}
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Mark: +{question.correctMarks}
            {question.wrongMarks !== "0" && ` / -${question.wrongMarks}`}
          </span>

          {/* Hindi / English Toggle */}
          {hasHindi && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="h-8 text-xs font-semibold gap-1.5 px-2.5 border-border rounded-lg cursor-pointer"
            >
              <Languages className="h-3.5 w-3.5" />
              <span>{lang === "en" ? "हिन्दी" : "English"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Question Body Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-5 pr-1">
        {!mathReady ? (
          <div className="space-y-6 select-none animate-pulse">
            {/* Question Text Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[95%] bg-muted/65" />
              <Skeleton className="h-4 w-[90%] bg-muted/65" />
              <Skeleton className="h-4 w-[75%] bg-muted/65" />
            </div>

            {/* Question image area placeholder if question has image */}
            {(question.originalImage || question.hindiImage) && (
              <Skeleton className="h-40 w-full max-w-md rounded-xl bg-muted/65 mx-auto" />
            )}

            {/* Choice inputs Skeleton */}
            {question.type === "MCQ_S" || question.type === "MCQ_M" ? (
              <div className="space-y-3 pt-4">
                {sortedOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="h-12 w-full rounded-xl border border-border bg-card/30 flex items-center gap-3 px-4"
                  >
                    <Skeleton className="h-4.5 w-4.5 rounded-full bg-muted/65 shrink-0" />
                    <Skeleton className="h-3 w-1/3 bg-muted/65" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5 max-w-xs pt-4">
                <Skeleton className="h-3 w-1/4 bg-muted/65" />
                <Skeleton className="h-[44px] w-full rounded-xl bg-muted/65" />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Question text */}
            <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
              {questionText}
            </div>

            {/* Question Image if present */}
            {questionImage && (
              <div className="rounded-xl overflow-hidden border border-border bg-muted/20 max-w-full md:max-w-2xl mx-auto">
                <img
                  src={questionImage}
                  alt={`Question ${questionNumber} Visual`}
                  className="max-h-72 object-contain mx-auto"
                />
              </div>
            )}

            {/* Toggle options on mobile */}
            <div className="block md:hidden select-none">
              <Button
                variant="outline"
                onClick={() => setMobileShowOptions(!mobileShowOptions)}
                className="w-full justify-between items-center text-xs font-semibold min-h-[44px] rounded-xl border-border bg-card px-4"
              >
                <span>{mobileShowOptions ? "Hide Options" : "Show Options"}</span>
                <span className="text-muted-foreground text-[10px]">
                  {mobileShowOptions ? "▲" : "▼"}
                </span>
              </Button>
            </div>

            {/* Response Inputs Area */}
            <div className={cn("pt-2 md:block", mobileShowOptions ? "block" : "hidden")}>
              {question.type === "MCQ_S" && (
                <RadioGroup
                  value={selectedOptionIds[0] || ""}
                  onValueChange={handleOptionSelect}
                  disabled={isReportMode}
                  className="space-y-2.5"
                >
                  {sortedOptions.map((opt) => {
                    const optText = getOptionText(opt);
                    const optImg = getOptionImage(opt);
                    const isSelected = selectedOptionIds.includes(opt.id);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleOptionSelect(opt.id)}
                        className={getOptionStyle(opt.id)}
                      >
                        <RadioGroupItem
                          value={opt.id}
                          id={opt.id}
                          disabled={isReportMode}
                          className="shrink-0 h-4.5 w-4.5 border-muted-foreground/60 text-primary focus:ring-primary/40"
                        />
                        <div className="flex-1 space-y-1.5">
                          <Label htmlFor={opt.id} className="text-xs font-medium cursor-pointer leading-tight">
                            {optText}
                          </Label>
                          {optImg && (
                            <img
                              src={optImg}
                              alt="Option Visual"
                              className="max-h-28 object-contain rounded mt-1.5"
                            />
                          )}
                        </div>

                        {isReportMode && (
                          <div className="shrink-0">
                            {opt.isCorrect ? (
                              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : isSelected ? (
                              <X className="h-4 w-4 text-rose-600 shrink-0" />
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
              )}

              {question.type === "MCQ_M" && (
                <div className="space-y-2.5">
                  {sortedOptions.map((opt) => {
                    const optText = getOptionText(opt);
                    const optImg = getOptionImage(opt);
                    const isSelected = selectedOptionIds.includes(opt.id);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleOptionSelect(opt.id)}
                        className={getOptionStyle(opt.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          id={opt.id}
                          disabled={isReportMode}
                          className="shrink-0 h-4.5 w-4.5 border-muted-foreground/60 rounded focus:ring-primary/40"
                        />
                        <div className="flex-1 space-y-1.5">
                          <Label htmlFor={opt.id} className="text-xs font-medium cursor-pointer leading-tight">
                            {optText}
                          </Label>
                          {optImg && (
                            <img
                              src={optImg}
                              alt="Option Visual"
                              className="max-h-28 object-contain rounded mt-1.5"
                            />
                          )}
                        </div>

                        {isReportMode && (
                          <div className="shrink-0">
                            {opt.isCorrect ? (
                              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : isSelected ? (
                              <X className="h-4 w-4 text-rose-600 shrink-0" />
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {(question.type === "NUM_U" || question.type === "NUM_R") && (
                <div className="max-w-xs space-y-3 select-none">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Your Answer
                  </label>
                  <Input
                    type="number"
                    step="any"
                    disabled={isReportMode}
                    value={isReportMode ? (evaluatedResponse?.numericAnswer ?? "") : (numericAnswer ?? "")}
                    onChange={(e) => handleNumericChange(e.target.value)}
                    placeholder="Enter numeric response..."
                    className={cn(
                      "min-h-[44px] rounded-xl border border-border text-sm font-medium",
                      isReportMode &&
                        (evaluatedResponse?.isCorrect
                          ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                          : evaluatedResponse?.numericAnswer
                          ? "border-rose-500 bg-rose-500/10 text-foreground"
                          : "border-border")
                    )}
                  />

                  {isReportMode && (
                    <div className="mt-3 text-xs space-y-1 bg-muted/40 rounded-xl p-3 border border-border/50">
                      {question.type === "NUM_U" && question.numExact && (
                        <div>
                          <span className="font-semibold text-muted-foreground">Correct Value:</span>{" "}
                          <span className="font-bold text-foreground">{question.numExact}</span>
                        </div>
                      )}
                      {question.type === "NUM_R" && question.numMin && question.numMax && (
                        <div>
                          <span className="font-semibold text-muted-foreground">Correct Range:</span>{" "}
                          <span className="font-bold text-foreground">
                            [{question.numMin}, {question.numMax}]
                          </span>
                        </div>
                      )}
                      {evaluatedResponse && (
                        <div className="pt-1.5 mt-1.5 border-t border-border flex items-center gap-1.5 font-semibold">
                          <span>Status:</span>
                          {evaluatedResponse.isCorrect ? (
                            <span className="text-emerald-600 flex items-center gap-0.5">
                              Correct (+{evaluatedResponse.marksAwarded})
                            </span>
                          ) : evaluatedResponse.isPartiallyCorrect ? (
                            <span className="text-blue-600 flex items-center gap-0.5">
                              Partially Correct (+{evaluatedResponse.marksAwarded})
                            </span>
                          ) : evaluatedResponse.numericAnswer ? (
                            <span className="text-rose-650 flex items-center gap-0.5">
                              Incorrect ({evaluatedResponse.marksAwarded})
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Not Attempted</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Clear Response Button (Attempt Mode only) */}
            {!isReportMode && (selectedOptionIds.length > 0 || numericAnswer !== "") && (
              <Button
                variant="ghost"
                onClick={onClearResponse}
                className="text-xs text-muted-foreground font-semibold hover:bg-muted/80 rounded-lg min-h-[36px] px-3 cursor-pointer mt-1"
              >
                Clear Response
              </Button>
            )}

            {/* Diagnostic Explanation (Report/Solution mode only) */}
            {isReportMode && question.solution && (
              <div className="mt-6 pt-5 border-t border-border/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <span>Explanation & Solution</span>
                </h4>
                <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                  {lang === "hi" && question.solution.hindiText
                    ? question.solution.hindiText
                    : question.solution.originalText}
                </div>
                {(lang === "hi" && question.solution.hindiImage
                  ? question.solution.hindiImage
                  : question.solution.originalImage) && (
                  <img
                    src={
                      lang === "hi" && question.solution.hindiImage
                        ? question.solution.hindiImage
                        : question.solution.originalImage!
                    }
                    alt="Solution Visual"
                    className="max-h-72 object-contain rounded border border-border mx-auto bg-muted/10 mt-2"
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
