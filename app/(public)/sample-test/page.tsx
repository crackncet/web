"use client";

import React, { useState, useEffect } from "react";
import {
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  BookOpen,
  Languages,
  GraduationCap,
  Brain,
  ArrowRight,
  Clock,
  BookText,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CbtLayout } from "@/components/cbt/_components/cbt-layout";
import { QuestionCard } from "@/components/cbt/_components/question-card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParsedOption {
  id: string;
  label: string;
  sequence: number;
  originalText: string;
  isCorrect: boolean;
}

interface ParsedSolution {
  originalText: string;
}

interface ParsedQuestion {
  id: string;
  index: number;
  type: "MCQ_S" | "MCQ_M" | "NUM_U" | "NUM_R";
  correctMarks: string;
  wrongMarks: string;
  originalText: string;
  options: ParsedOption[];
  solution: ParsedSolution | null;
  numExact: string | null;
  numMin: string | null;
  numMax: string | null;
  sectionId?: string;
}

// ─── Subjects Configuration ──────────────────────────────────────────────────

const SUBJECTS = [
  {
    id: "physics",
    title: "Class 12 Physics",
    filename: "class_12_physics_test_paper.md",
    icon: Atom,
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20 hover:border-blue-500/40 text-blue-600 dark:text-blue-400",
    questionsCount: 10,
    timeLimit: 15,
  },
  {
    id: "chemistry",
    title: "Class 12 Chemistry",
    filename: "class_12_chemistry_test_paper.md",
    icon: FlaskConical,
    color: "from-teal-500/20 to-emerald-500/10 border-teal-500/20 hover:border-teal-500/40 text-teal-600 dark:text-teal-400",
    questionsCount: 10,
    timeLimit: 15,
  },
  {
    id: "mathematics",
    title: "Class 12 Mathematics",
    filename: "class_12_mathematics_test_paper.md",
    icon: Calculator,
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40 text-violet-600 dark:text-violet-400",
    questionsCount: 10,
    timeLimit: 15,
  },
  {
    id: "biology",
    title: "Class 12 Biology",
    filename: "class_12_biology_test_paper.md",
    icon: Dna,
    color: "from-green-500/20 to-emerald-500/10 border-green-500/20 hover:border-green-500/40 text-green-600 dark:text-green-400",
    questionsCount: 10,
    timeLimit: 15,
  },
  {
    id: "english",
    title: "Class 12 English",
    filename: "class_12_english_test_paper.md",
    icon: BookOpen,
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 text-amber-600 dark:text-amber-400",
    questionsCount: 10,
    timeLimit: 15,
  },
  {
    id: "hindi",
    title: "Class 12 Hindi",
    filename: "class_12_hindi_test_paper.md",
    icon: Languages,
    color: "from-rose-500/20 to-pink-500/10 border-rose-500/20 hover:border-rose-500/40 text-rose-600 dark:text-rose-400",
    questionsCount: 10,
    timeLimit: 15,
  },
  {
    id: "teaching-aptitude",
    title: "Teaching Aptitude",
    filename: "teaching_aptitude_test_paper.md",
    icon: GraduationCap,
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40 text-cyan-600 dark:text-cyan-400",
    questionsCount: 10,
    timeLimit: 15,
  },
  {
    id: "general-aptitude",
    title: "General Aptitude",
    filename: "general_aptitude_test_paper.md",
    icon: Brain,
    color: "from-orange-500/20 to-rose-500/10 border-orange-500/20 hover:border-orange-500/40 text-orange-600 dark:text-orange-400",
    questionsCount: 10,
    timeLimit: 15,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseYAML(yamlStr: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = yamlStr.split("\n");
  let currentKey: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("-") && currentKey) {
      const val = trimmed.slice(1).trim();
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      result[currentKey].push(val);
      continue;
    }

    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      currentKey = key;

      if (val) {
        result[key] = val.replace(/^['"]|['"]$/g, ""); // strip quotes
      } else {
        result[key] = null;
      }
    }
  }
  return result;
}

function parseClientOptions(qId: string, text: string): ParsedOption[] {
  const options: ParsedOption[] = [];
  const lines = text.split("\n");
  let currentLabel: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^([A-Z])\)\s+(.*)/);
    if (match) {
      if (currentLabel !== null) {
        options.push({
          id: `${qId}-opt-${currentLabel}`,
          label: currentLabel,
          sequence: options.length,
          originalText: currentLines.join("\n").trim(),
          isCorrect: false,
        });
      }
      currentLabel = match[1];
      currentLines = [match[2]];
    } else if (currentLabel !== null) {
      currentLines.push(line);
    }
  }

  if (currentLabel !== null) {
    options.push({
      id: `${qId}-opt-${currentLabel}`,
      label: currentLabel,
      sequence: options.length,
      originalText: currentLines.join("\n").trim(),
      isCorrect: false,
    });
  }

  return options;
}

function parseMarkdownToQuestions(content: string): ParsedQuestion[] {
  const BOUNDARY = "===QUESTION_BOUNDARY===";
  const cards = content
    .split(BOUNDARY)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const questions: ParsedQuestion[] = [];

  cards.forEach((card, idx) => {
    const qId = `q-${idx}`;
    const fmMatch = card.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) return;

    const frontmatter = parseYAML(fmMatch[1]);
    const bodyRaw = card.slice(fmMatch[0].length).trim();
    if (!bodyRaw) return;

    const solutionSplit = bodyRaw.split(/^###\s*Solution\s*$/m);
    const mainBody = solutionSplit[0].trim();
    const solutionText = solutionSplit[1]?.trim() || null;

    const solution: ParsedSolution | null = solutionText
      ? { originalText: solutionText }
      : null;

    const type = (frontmatter.type || "MCQ_S") as any;
    const correctMarks = String(frontmatter.correct_marks || "4");
    const wrongMarks = String(frontmatter.wrong_marks || "1");

    if (type === "MCQ_S" || type === "MCQ_M") {
      const lines = mainBody.split("\n");
      let firstOptionIndex = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (/^A\)\s/.test(lines[i])) {
          firstOptionIndex = i;
          break;
        }
      }

      if (firstOptionIndex !== -1) {
        const questionText = lines.slice(0, firstOptionIndex).join("\n").trim();
        const optionsBlock = lines.slice(firstOptionIndex).join("\n");
        const options = parseClientOptions(qId, optionsBlock);

        if (type === "MCQ_S") {
          const correctLabel = String(frontmatter.correct_option || "").trim();
          const found = options.find((o) => o.label === correctLabel);
          if (found) found.isCorrect = true;
        } else {
          let correctLabels: string[] = [];
          const rawOptions = frontmatter.correct_options;
          if (Array.isArray(rawOptions)) {
            correctLabels = rawOptions.map((o) => String(o).trim());
          } else if (typeof rawOptions === "string") {
            correctLabels = rawOptions.split(",").map((s) => s.trim());
          } else if (rawOptions) {
            correctLabels = [String(rawOptions).trim()];
          }

          correctLabels.forEach((label) => {
            const found = options.find((o) => o.label === label);
            if (found) found.isCorrect = true;
          });
        }

        questions.push({
          id: qId,
          index: idx,
          type,
          correctMarks,
          wrongMarks,
          originalText: questionText,
          options,
          solution,
          numExact: null,
          numMin: null,
          numMax: null,
        });
      }
    } else {
      questions.push({
        id: qId,
        index: idx,
        type,
        correctMarks,
        wrongMarks,
        originalText: mainBody,
        options: [],
        solution,
        numExact: frontmatter.num_exact ? String(frontmatter.num_exact) : null,
        numMin: frontmatter.num_min ? String(frontmatter.num_min) : null,
        numMax: frontmatter.num_max ? String(frontmatter.num_max) : null,
      });
    }
  });

  return questions;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PublicSampleTestPage() {
  const [gameState, setGameState] = useState<"SELECT" | "INSTRUCTIONS" | "TESTING" | "RESULT" | "REVIEW">("SELECT");
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[number] | null>(null);
  const [testMode, setTestMode] = useState<"TEST" | "PRACTICE">("TEST"); // TEST vs PRACTICE
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120 * 60);

  // User state responses
  const [responses, setResponses] = useState<Record<string, {
    selectedOptionIds: string[];
    numericAnswer: string | null;
    status: "ANSWERED" | "NOT_ANSWERED" | "MARKED_FOR_REVIEW" | "ANSWERED_AND_MARKED" | "NOT_VISITED";
  }>>({});

  // Submission Results
  const [results, setResults] = useState<{
    score: number;
    correctCount: number;
    incorrectCount: number;
    unattemptedCount: number;
    evaluated: Record<string, any>;
  } | null>(null);

  // 1. Timer Logic
  useEffect(() => {
    if (gameState !== "TESTING" || testMode !== "TEST") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, testMode, questions, responses]);

  // 2. Load unified Full Mock Test (Test Mode)
  const handleSelectFullMockTest = () => {
    setSelectedSubject(null);
    setTestMode("TEST");
    setGameState("INSTRUCTIONS");
    setAgreed(false);
  };

  // 3. Load individual Subject (Practice Mode)
  const handleSelectSubjectPractice = (subj: typeof SUBJECTS[number]) => {
    setSelectedSubject(subj);
    setTestMode("PRACTICE");
    setGameState("INSTRUCTIONS");
    setAgreed(false);
  };

  const handleStartExam = async () => {
    setLoading(true);
    try {
      if (testMode === "TEST") {
        // Load all 8 subject papers in parallel
        const promises = SUBJECTS.map(async (subj) => {
          const res = await fetch(`/test-papers/${subj.filename}`);
          const markdown = await res.text();
          return {
            subject: subj,
            questions: parseMarkdownToQuestions(markdown),
          };
        });

        const parsedResults = await Promise.all(promises);

        let allQuestions: ParsedQuestion[] = [];
        let allSections: any[] = [];

        parsedResults.forEach((res, sIdx) => {
          const secId = `sec-${res.subject.id}`;
          allSections.push({
            id: secId,
            title: res.subject.title,
          });

          const updatedQuestions = res.questions.map((q, qIdx) => ({
            ...q,
            id: `full-${res.subject.id}-${q.id}`,
            sectionId: secId,
            options: q.options.map((opt) => ({
              ...opt,
              id: `full-${res.subject.id}-${opt.id}`,
            })),
          }));

          allQuestions = [...allQuestions, ...updatedQuestions];
        });

        setQuestions(allQuestions);
        setSections(allSections);

        const initialResponses: Record<string, any> = {};
        allQuestions.forEach((q) => {
          initialResponses[q.id] = {
            selectedOptionIds: [],
            numericAnswer: null,
            status: "NOT_VISITED",
          };
        });
        setResponses(initialResponses);
        setCurrentIndex(0);
        setTimeLeft(120 * 60); // 120 minutes full duration
        setGameState("TESTING");
      } else {
        // Practice Mode: Single subject
        if (!selectedSubject) return;
        const res = await fetch(`/test-papers/${selectedSubject.filename}`);
        const markdown = await res.text();
        const parsed = parseMarkdownToQuestions(markdown);

        const secId = `sec-${selectedSubject.id}`;
        const updatedQuestions = parsed.map((q) => ({
          ...q,
          sectionId: secId,
        }));

        setQuestions(updatedQuestions);
        setSections([
          {
            id: secId,
            title: selectedSubject.title,
          },
        ]);

        const initialResponses: Record<string, any> = {};
        updatedQuestions.forEach((q) => {
          initialResponses[q.id] = {
            selectedOptionIds: [],
            numericAnswer: null,
            status: "NOT_VISITED",
          };
        });
        setResponses(initialResponses);
        setCurrentIndex(0);
        setGameState("TESTING");
      }
    } catch (err) {
      console.error("Failed to start CBT session", err);
      alert("Failed to load test papers. Please verify that the files are present in web/public/test-papers/");
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle attempt interactions
  const handleChangeResponse = (selectedIds: string[], numValue: string | null) => {
    if (!questions[currentIndex]) return;
    const activeQuestion = questions[currentIndex];

    setResponses((prev) => {
      const currentResp = prev[activeQuestion.id] || {
        selectedOptionIds: [],
        numericAnswer: null,
        status: "NOT_VISITED",
      };

      const hasAnswer = selectedIds.length > 0 || numValue !== null;
      const isMarked =
        currentResp.status === "MARKED_FOR_REVIEW" ||
        currentResp.status === "ANSWERED_AND_MARKED";

      let nextStatus: typeof currentResp.status = "NOT_ANSWERED";
      if (hasAnswer) {
        nextStatus = isMarked ? "ANSWERED_AND_MARKED" : "ANSWERED";
      } else {
        nextStatus = isMarked ? "MARKED_FOR_REVIEW" : "NOT_ANSWERED";
      }

      return {
        ...prev,
        [activeQuestion.id]: {
          selectedOptionIds: selectedIds,
          numericAnswer: numValue,
          status: nextStatus,
        },
      };
    });
  };

  const handleClearResponse = () => {
    if (!questions[currentIndex]) return;
    const activeQuestion = questions[currentIndex];
    setResponses((prev) => ({
      ...prev,
      [activeQuestion.id]: {
        selectedOptionIds: [],
        numericAnswer: null,
        status: "NOT_ANSWERED",
      },
    }));
  };

  const handleMarkForReview = () => {
    if (!questions[currentIndex]) return;
    const activeQuestion = questions[currentIndex];

    setResponses((prev) => {
      const currentResp = prev[activeQuestion.id] || {
        selectedOptionIds: [],
        numericAnswer: null,
        status: "NOT_VISITED",
      };

      const hasAnswer =
        currentResp.selectedOptionIds.length > 0 || currentResp.numericAnswer !== null;
      const isCurrentlyMarked =
        currentResp.status === "MARKED_FOR_REVIEW" ||
        currentResp.status === "ANSWERED_AND_MARKED";

      let nextStatus: typeof currentResp.status = "NOT_ANSWERED";
      if (isCurrentlyMarked) {
        nextStatus = hasAnswer ? "ANSWERED" : "NOT_ANSWERED";
      } else {
        nextStatus = hasAnswer ? "ANSWERED_AND_MARKED" : "MARKED_FOR_REVIEW";
      }

      return {
        ...prev,
        [activeQuestion.id]: {
          ...currentResp,
          status: nextStatus,
        },
      };
    });
  };

  // 5. Submit & Evaluation
  const handleSubmit = (auto = false) => {
    if (!auto && !confirm("Are you sure you want to submit your CBT mock test?")) return;

    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const evaluated: Record<string, any> = {};

    questions.forEach((q) => {
      const resp = responses[q.id] || { selectedOptionIds: [], numericAnswer: null };
      const { selectedOptionIds, numericAnswer } = resp;
      const correctMarks = Number(q.correctMarks) || 4;
      const wrongMarks = Number(q.wrongMarks) || 1;

      let isAttempted = false;
      let isCorrect = false;

      if (q.type === "MCQ_S") {
        isAttempted = selectedOptionIds.length > 0;
        if (isAttempted) {
          const selectedOpt = q.options.find((o) => o.id === selectedOptionIds[0]);
          isCorrect = selectedOpt?.isCorrect || false;
        }
      } else if (q.type === "MCQ_M") {
        isAttempted = selectedOptionIds.length > 0;
        if (isAttempted) {
          const correctOpts = q.options.filter((o) => o.isCorrect).map((o) => o.id);
          const incorrectOpts = q.options.filter((o) => !o.isCorrect).map((o) => o.id);

          const allCorrectSelected = correctOpts.every((id) => selectedOptionIds.includes(id));
          const noIncorrectSelected = incorrectOpts.every((id) => !selectedOptionIds.includes(id));
          isCorrect = allCorrectSelected && noIncorrectSelected;
        }
      } else if (q.type === "NUM_U") {
        isAttempted = numericAnswer !== null && numericAnswer !== "";
        if (isAttempted) {
          isCorrect = Math.abs(Number(numericAnswer) - Number(q.numExact)) < 0.0001;
        }
      } else if (q.type === "NUM_R") {
        isAttempted = numericAnswer !== null && numericAnswer !== "";
        if (isAttempted) {
          const val = Number(numericAnswer);
          isCorrect = val >= Number(q.numMin) && val <= Number(q.numMax);
        }
      }

      let marksAwarded = "0";
      if (isAttempted) {
        if (isCorrect) {
          score += correctMarks;
          correctCount++;
          marksAwarded = `+${correctMarks}`;
        } else {
          score -= wrongMarks;
          incorrectCount++;
          marksAwarded = `-${wrongMarks}`;
        }
      } else {
        unattemptedCount++;
      }

      evaluated[q.id] = {
        selectedOptionIds,
        numericAnswer,
        isCorrect,
        isPartiallyCorrect: false,
        marksAwarded,
      };
    });

    setResults({
      score,
      correctCount,
      incorrectCount,
      unattemptedCount,
      evaluated,
    });

    setGameState("RESULT");
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Convert evaluation results for CbtLayout Review mode
  const mappedEvaluatedResponses = results
    ? Object.keys(results.evaluated).map((qId) => {
        const item = results.evaluated[qId];
        return {
          questionId: qId,
          isCorrect: item.isCorrect,
          isPartiallyCorrect: item.isPartiallyCorrect,
          status: item.isCorrect
            ? "CORRECT"
            : item.selectedOptionIds.length > 0 || item.numericAnswer
            ? "INCORRECT"
            : "UNATTEMPTED",
        };
      })
    : [];

  const activeQuestion = questions[currentIndex];
  const activeResponse = activeQuestion
    ? responses[activeQuestion.id] || { selectedOptionIds: [], numericAnswer: "" }
    : { selectedOptionIds: [], numericAnswer: "" };

  const activeEvaluated = results && activeQuestion ? results.evaluated[activeQuestion.id] : null;

  // ─── Renders ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-background space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-muted-foreground">Preparing examination workspace...</p>
      </div>
    );
  }

  // 1. SELECT SUBJECT SCREEN
  if (gameState === "SELECT") {
    return (
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-16 flex flex-col space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>CBT Simulator Sandbox</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground bg-gradient-to-r from-primary via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            CrackNCET Mock Exam Center
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Test and audit our high-fidelity student Computer Based Test (CBT) engine. Attempt a full exam in Test Mode, or select a single subject to practice without logging in.
          </p>
        </div>

        {/* FEATURED MOCK TEST SECTION (TEST MODE) */}
        <div className="bg-card border-2 border-primary/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(var(--primary),0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="h-44 w-44 text-primary" />
          </div>
          <div className="space-y-4 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-[10px] font-bold text-rose-500 uppercase tracking-wide">
              Highly Recommended
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
              Full-Length NCET Mock Exam (Test Mode)
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Strict exam simulation combining all 8 NCET sections (English, Hindi, Physics, Chemistry, Maths, Biology, Teaching Aptitude, General Aptitude). Features a countdown timer, flat navigator list, and strict submission rules.
            </p>
            <div className="flex gap-4 text-xs font-bold text-muted-foreground pt-1">
              <span>80 Questions</span>
              <span>•</span>
              <span>120 Minutes Duration</span>
              <span>•</span>
              <span>320 Marks Max</span>
            </div>
          </div>
          <div className="shrink-0 z-10">
            <Button
              onClick={handleSelectFullMockTest}
              className="w-full md:w-auto h-[48px] rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 px-6 shadow-md gap-2"
            >
              <Play className="h-4.5 w-4.5 fill-current" />
              <span>Begin Full Exam</span>
            </Button>
          </div>
        </div>

        {/* INDIVIDUAL PRACTICE SETS (PRACTICE MODE) */}
        <div className="space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-foreground">
              Subject-wise Practice Sets (Practice Mode)
            </h3>
            <p className="text-xs text-muted-foreground">
              Attempt individual subject papers at your own pace with sections grouped in the navigator and no time constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUBJECTS.map((subj) => {
              const Icon = subj.icon;
              return (
                <div
                  key={subj.id}
                  onClick={() => handleSelectSubjectPractice(subj)}
                  className={`group border rounded-3xl p-6 bg-gradient-to-br ${subj.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between min-h-[200px] relative overflow-hidden`}
                >
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-card border border-border/80 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                        {subj.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground/80 mt-1 uppercase font-semibold">
                        Practice Session
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-border/40 mt-4">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {subj.questionsCount} Qs • Practice Mode
                    </div>
                    <span className="h-8 w-8 rounded-full bg-card border border-border/60 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. INSTRUCTIONS SCREEN
  if (gameState === "INSTRUCTIONS") {
    const isMock = testMode === "TEST";
    const title = isMock ? "NCET Full Mock Exam" : `${selectedSubject?.title} Practice`;
    const qCount = isMock ? 80 : selectedSubject?.questionsCount || 10;
    const duration = isMock ? 120 : "Untimed";
    const Icon = selectedSubject?.icon || Trophy;

    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col justify-center">
        <div className="bg-card border border-border/65 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-border/65">
            <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {isMock ? "Test Mode Simulation" : "Practice Mode Sandbox"}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="bg-muted/30 border border-border/30 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Questions</span>
              <span className="text-lg font-bold text-foreground mt-1 block">{qCount}</span>
            </div>
            <div className="bg-muted/30 border border-border/30 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Duration</span>
              <span className="text-lg font-bold text-foreground mt-1 block">{duration} {isMock ? "Mins" : ""}</span>
            </div>
            <div className="bg-muted/30 border border-border/30 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Correct Marks</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">+4 Marks</span>
            </div>
            <div className="bg-muted/30 border border-border/30 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Wrong Marks</span>
              <span className="text-lg font-bold text-rose-500 mt-1 block">-1 Mark</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookText className="h-4 w-4 text-primary" />
              <span>General Instructions</span>
            </h3>
            <ul className="text-xs text-muted-foreground/90 space-y-2 list-disc pl-4 leading-relaxed">
              <li>The test contains Multiple Choice Questions (Single Correct MCQ_S, Multiple Correct MCQ_M) and Numerical Questions (NUM_U, NUM_R).</li>
              <li>For MCQs, click on the options to select your answer. For Numerical Questions, type your answer in the box.</li>
              <li>You can click "Mark for Review" to star a question and return to it later from the Navigator.</li>
              <li>Make sure to click "Save and Next" to record your response before proceeding.</li>
              {isMock ? (
                <li className="text-rose-500 font-bold">In Test Mode, a flat list of questions is rendered, and strict authoritative time limits are applied.</li>
              ) : (
                <li className="text-emerald-600 font-bold">In Practice Mode, questions are grouped by subjects in the Navigator panel for targeted training.</li>
              )}
            </ul>
          </div>

          <div className="pt-4 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 border-muted-foreground/60 rounded text-primary focus:ring-primary/40"
              />
              <span className="text-xs text-muted-foreground font-medium leading-tight">
                I have read and understood all instructions. I am ready to start my mock practice.
              </span>
            </label>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setGameState("SELECT")} className="h-[44px] rounded-xl font-bold border-border">
                Go Back
              </Button>
              <Button
                disabled={!agreed}
                onClick={handleStartExam}
                className="h-[44px] rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-6"
              >
                Begin CBT Attempt
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. TESTING CBT WORKSPACE
  if (gameState === "TESTING") {
    // Format responses for CbtLayout navigator status mapping
    const mappedResponses: Record<string, any> = {};
    Object.keys(responses).forEach((key) => {
      mappedResponses[key] = {
        selectedOptionIds: responses[key].selectedOptionIds,
        numericAnswer: responses[key].numericAnswer,
        status: responses[key].status,
      };
    });

    return (
      <CbtLayout
        mode={testMode}
        title={testMode === "TEST" ? "NCET Full-Length Mock Exam" : `${selectedSubject?.title} Practice`}
        subjectName={testMode === "TEST" ? "Unified Mock" : selectedSubject?.title || "Practice"}
        questions={questions as any}
        sections={sections}
        currentIndex={currentIndex}
        onSelectIndex={setCurrentIndex}
        responses={mappedResponses}
        onSaveResponse={() => {}} // Auto saves in responses state onChange
        onMarkForReview={handleMarkForReview}
        onClearResponse={handleClearResponse}
        onSubmit={() => handleSubmit(false)}
        onClose={() => {
          if (confirm("Exit mock test? Your progress will be lost.")) {
            setGameState("SELECT");
          }
        }}
        timerText={testMode === "TEST" ? formatTimer(timeLeft) : undefined}
      >
        {activeQuestion && (
          <QuestionCard
            question={activeQuestion as any}
            questionNumber={currentIndex + 1}
            selectedOptionIds={activeResponse.selectedOptionIds}
            numericAnswer={activeResponse.numericAnswer}
            onChangeResponse={handleChangeResponse}
            onClearResponse={handleClearResponse}
            isReportMode={false}
          />
        )}
      </CbtLayout>
    );
  }

  // 4. RESULTS DASHBOARD
  if (gameState === "RESULT" && results) {
    const title = testMode === "TEST" ? "NCET Full Mock Exam" : `${selectedSubject?.title} Practice`;
    const totalMarks = questions.reduce((acc, q) => acc + (Number(q.correctMarks) || 4), 0);
    const percentage = Math.max(0, Math.round((results.score / totalMarks) * 100));

    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col justify-center">
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl space-y-8 select-none">
          <div className="text-center space-y-3 pb-6 border-b border-border">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Test Completed Successfully</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              Mock Scorecard Analysis
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              {title} • Instant Diagnostic Output
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Score Ring */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/20 border border-border/40 rounded-2xl">
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" className="text-muted/20" fill="transparent" />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-primary transition-all duration-500"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - percentage / 100)}
                  />
                </svg>
                <div className="text-center">
                  <span className="text-2xl font-black text-foreground">{results.score}</span>
                  <span className="text-[10px] text-muted-foreground block border-t border-border mt-0.5 pt-0.5">Max {totalMarks}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground mt-4 uppercase">Overall Score</span>
            </div>

            {/* Stats Breakdown */}
            <div className="col-span-2 grid grid-cols-3 gap-4">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-semibold text-emerald-600 block uppercase">Correct</span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 block">{results.correctCount}</span>
              </div>
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-semibold text-rose-500 block uppercase">Incorrect</span>
                <span className="text-xl font-bold text-rose-600 mt-1 block">{results.incorrectCount}</span>
              </div>
              <div className="bg-muted/40 border border-border/30 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Skipped</span>
                <span className="text-xl font-bold text-foreground mt-1 block">{results.unattemptedCount}</span>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Button
              onClick={() => setGameState("SELECT")}
              variant="outline"
              className="min-h-[44px] rounded-xl font-bold border-border cursor-pointer flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <span>Retry / Other Subject</span>
            </Button>
            <Button
              onClick={() => {
                setCurrentIndex(0);
                setGameState("REVIEW");
              }}
              className="min-h-[44px] rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex-1 cursor-pointer"
            >
              <span>Review Detailed Solutions</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 5. REVIEW MODE (CBT REPORT)
  if (gameState === "REVIEW" && results) {
    return (
      <CbtLayout
        mode="REPORT"
        title={testMode === "TEST" ? "NCET Full Mock Review" : `${selectedSubject?.title} Practice Review`}
        subjectName={testMode === "TEST" ? "Mock Review" : selectedSubject?.title || "Review"}
        questions={questions as any}
        sections={sections}
        currentIndex={currentIndex}
        onSelectIndex={setCurrentIndex}
        responses={responses}
        evaluatedResponses={mappedEvaluatedResponses}
        onClose={() => setGameState("RESULT")}
      >
        {activeQuestion && (
          <QuestionCard
            question={activeQuestion as any}
            questionNumber={currentIndex + 1}
            selectedOptionIds={activeResponse.selectedOptionIds}
            numericAnswer={activeResponse.numericAnswer}
            isReportMode={true}
            evaluatedResponse={activeEvaluated}
          />
        )}
      </CbtLayout>
    );
  }

  return null;
}
