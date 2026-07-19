import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface CbtAttempt {
  id: string;
  studentId: string;
  testId: string;
  testSeriesId: string;
  attemptNumber: number;
  status: "STARTED" | "SUBMITTED" | "EVALUATED";
  serverStartsAt: string;
  serverEndsAt: string;
  startedAt: string;
  submittedAt: string | null;
  evaluatedAt: string | null;
  autoSubmitted: boolean;
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
  responses: {
    questions: Array<{
      questionId: string;
      selectedOptionIds?: string[];
      numericAnswer?: string | null;
      timeSpentSeconds: number;
      status: "ANSWERED" | "NOT_ANSWERED" | "MARKED_FOR_REVIEW" | "ANSWERED_AND_MARKED" | "NOT_VISITED";
      isCorrect?: boolean | null;
      isPartiallyCorrect?: boolean;
      marksAwarded?: string;
    }>;
  } | null;
}

export interface CbtSubjectScore {
  id: string;
  attemptId: string;
  subjectName: string;
  subjectId: string;
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
}

export interface CbtSection {
  id: string;
  bankId: string;
  title: string;
  sequence: number;
}

export interface CbtOption {
  id: string;
  questionId: string;
  originalText: string;
  originalImage: string | null;
  hindiText: string | null;
  hindiImage: string | null;
  sequence: number;
  isCorrect?: boolean;
}

export interface CbtSolution {
  questionId: string;
  originalText: string;
  hindiText: string | null;
  originalImage: string | null;
  hindiImage: string | null;
}

export interface CbtQuestion {
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
  bankId: string;
  maxQuestionsToAttempt: number | null;
  isOptional: boolean;
  options: CbtOption[];
  solution?: CbtSolution | null;
}

export interface CbtAttemptPayload {
  attemptId: string;
  responses: Array<{
    questionId: string;
    selectedOptionIds?: string[];
    numericAnswer?: string | null;
    timeSpentSeconds: number;
    status: "ANSWERED" | "NOT_ANSWERED" | "MARKED_FOR_REVIEW" | "ANSWERED_AND_MARKED" | "NOT_VISITED";
  }>;
  serverEndsAt: string;
  serverTime: string;
  syncSeq: number;
  sections: CbtSection[];
  questions: CbtQuestion[];
}

export interface CbtSyncResponse {
  accepted: number;
  serverTime: string;
  syncSeq: number;
}

export interface CbtReportPayload {
  attempt: CbtAttempt;
  allAttempts: Array<{
    id: string;
    testId: string;
    attemptNumber: number;
    totalScore: string;
    maxPossibleScore: string;
    submittedAt: string | null;
  }>;
  subjectScores: CbtSubjectScore[];
  sections: CbtSection[];
  questions: CbtQuestion[];
}

export interface CbtClockSyncPayload {
  serverTime: string;
  startsAt: string | null;
  endsAt: string | null;
  durationMinutes: number;
}

/**
 * Clock Sync
 */
export async function getCbtClockSync(testId: string) {
  const response = await apiClient.get<ApiSuccessResponse<CbtClockSyncPayload>>(
    `/classroom/tests/${testId}/cbt/clock-sync`
  );
  return response.data;
}

/**
 * Start CBT Attempt
 */
export async function startCbtAttempt(testId: string) {
  const response = await apiClient.post<ApiSuccessResponse<CbtAttemptPayload>>(
    `/classroom/tests/${testId}/cbt/start`
  );
  return response.data;
}

/**
 * Sync CBT Responses
 */
export async function syncCbtResponses(
  testId: string,
  payload: { attemptId: string; patches: any[]; syncSeq: number }
) {
  const response = await apiClient.patch<ApiSuccessResponse<CbtSyncResponse>>(
    `/classroom/tests/${testId}/cbt/sync`,
    payload
  );
  return response.data;
}

/**
 * Submit CBT Attempt
 */
export async function submitCbtAttempt(testId: string, payload: { attemptId: string }) {
  const response = await apiClient.post<ApiSuccessResponse<{ submitted: boolean; serverTime: string }>>(
    `/classroom/tests/${testId}/cbt/submit`,
    payload
  );
  return response.data;
}

/**
 * Resume CBT Attempt
 */
export async function resumeCbtAttempt(testId: string) {
  const response = await apiClient.get<ApiSuccessResponse<CbtAttemptPayload>>(
    `/classroom/tests/${testId}/cbt/resume`
  );
  return response.data;
}

/**
 * Fetch CBT Test Report
 */
export async function getCbtReport(testId: string) {
  const response = await apiClient.get<ApiSuccessResponse<CbtReportPayload>>(
    `/classroom/tests/${testId}/cbt/report`
  );
  return response.data;
}
