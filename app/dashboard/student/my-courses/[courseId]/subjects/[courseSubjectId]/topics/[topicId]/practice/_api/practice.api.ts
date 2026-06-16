import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface PracticeAttempt {
  id: string;
  studentId: string;
  courseId: string;
  bankId: string;
  source: "DPP" | "CHAPTER_PRACTICE";
  topicId: string | null;
  chapterId: string | null;
  attemptNumber: number;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  responses: {
    questions: Array<{
      questionId: string;
      selectedOptionIds: string[];
      numericAnswer: string | null;
      timeSpentSeconds: number;
      isCorrect: boolean | null;
      isPartiallyCorrect: boolean;
      marksAwarded: string;
      status: "ANSWERED" | "NOT_ANSWERED" | "MARKED_FOR_REVIEW" | "ANSWERED_AND_MARKED" | "NOT_VISITED";
    }>;
  } | null;
  totalQuestions: number;
  totalAttempted: number;
  totalCorrect: number;
  totalPartialCorrect: number;
  totalIncorrect: number;
  maxPossibleScore: string;
  positiveScore: string;
  negativeScore: string;
  totalScore: string;
  accuracy: string;
  totalTimeSeconds: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeSection {
  id: string;
  title: string;
  sequence: number;
}

export interface PracticeOption {
  id: string;
  questionId: string;
  originalText: string;
  originalImage: string | null;
  hindiText: string | null;
  hindiImage: string | null;
  sequence: number;
  isCorrect?: boolean;
}

export interface PracticeSolution {
  questionId: string;
  originalText: string;
  hindiText: string | null;
  originalImage: string | null;
  hindiImage: string | null;
}

export interface PracticeQuestion {
  id: string;
  type: "MCQ_S" | "MCQ_M" | "NUM_U" | "NUM_R";
  correctMarks: string;
  wrongMarks: string;
  partialMarks: string | null;
  numExact?: string;
  numMin?: string;
  numMax?: string;
  originalText: string;
  originalImage: string | null;
  hindiText: string | null;
  hindiImage: string | null;
  sequence: number;
  sectionId: string | null;
  options: PracticeOption[];
  solution?: PracticeSolution | null;
}

export interface PracticeAttemptPayload {
  attempt: PracticeAttempt;
  sections: PracticeSection[];
  questions: PracticeQuestion[];
}

export interface PracticeReportPayload {
  attempt: PracticeAttempt;
  allAttempts: Array<{
    id: string;
    attemptNumber: number;
    totalScore: string;
    accuracy: string;
    totalTimeSeconds: number;
    completedAt: string | null;
  }>;
  sections: PracticeSection[];
  questions: PracticeQuestion[];
}

export interface SubmitPracticeResponse {
  questionId: string;
  selectedOptionIds: string[];
  numericAnswer: string | null;
  timeSpentSeconds: number;
  status: "ANSWERED" | "NOT_ANSWERED" | "MARKED_FOR_REVIEW" | "ANSWERED_AND_MARKED" | "NOT_VISITED";
}

export interface SubmitPracticeAttemptInput {
  attemptId: string;
  responses: SubmitPracticeResponse[];
}

/**
 * Fetch or start a practice attempt.
 */
export async function getOrStartPracticeAttempt(bankId: string, newAttempt = false) {
  const response = await apiClient.get<ApiSuccessResponse<PracticeAttemptPayload>>(
    `/classroom/practice/${bankId}/attempt`,
    {
      params: { newAttempt },
    }
  );
  return response.data;
}

/**
 * Submit practice attempt responses.
 */
export async function submitPracticeAttempt(bankId: string, payload: SubmitPracticeAttemptInput) {
  const response = await apiClient.post<ApiSuccessResponse<PracticeAttemptPayload>>(
    `/classroom/practice/${bankId}/submit`,
    payload
  );
  return response.data;
}

/**
 * Fetch a completed practice attempt report.
 */
export async function getPracticeReport(
  bankId: string,
  params: { attemptId?: string; attemptNumber?: number }
) {
  const response = await apiClient.get<ApiSuccessResponse<PracticeReportPayload>>(
    `/classroom/practice/${bankId}/report`,
    { params }
  );
  return response.data;
}
