import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface QuestionBank {
  id: string;
  title: string;
  isActive: boolean;
  subjectId: string;
  subjectName: string | null;
}

export interface QuestionBankSection {
  id: string;
  title: string;
  sequence: number;
}

export interface QuestionOption {
  id?: string;
  originalText: string;
  originalImage?: string | null;
  hindiText?: string | null;
  hindiImage?: string | null;
  isCorrect: boolean;
  sequence: number;
}

export interface QuestionSolution {
  originalText: string;
  originalImage?: string | null;
  hindiText?: string | null;
  hindiImage?: string | null;
}

export interface Question {
  id: string;
  type: "MCQ_S" | "MCQ_M" | "NUM_U" | "NUM_R";
  sectionId?: string | null;
  originalText: string;
  originalImage: string | null;
  hindiText: string | null;
  hindiImage: string | null;
  correctMarks: string;
  wrongMarks: string;
  partialMarks: string | null;
  numExact: string | null;
  numMin: string | null;
  numMax: string | null;
  sequence: number;
  options: QuestionOption[];
  solution?: QuestionSolution | null;
}

export interface QuestionBankDetail {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string | null;
  subjectType?: "DOMAIN" | "NON_DOMAIN" | "LANGUAGE" | null;
  sections: QuestionBankSection[];
  questions: Question[];
}

export interface ListQuestionBanksQuery {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  isActive?: boolean;
}

export interface CreateQuestionBankInput {
  title: string;
  subjectId: string;
}

export interface UpdateQuestionBankInput {
  title?: string;
  isActive?: boolean;
}

export interface CreateSectionInput {
  title: string;
  sequence: number;
}

export interface UpdateSectionInput {
  title?: string;
  sequence?: number;
}

export interface PreviewResponse {
  jobId: string;
}

export interface PreviewStatusResponse {
  status: "waiting" | "active" | "completed" | "failed" | "delayed";
  data: {
    questions: any[];
    errors: { index: number; error: string }[];
  } | null;
  failedReason: string | null;
}

export interface UploadQuestionsInput {
  questions: any[];
  previewFilePath?: string;
}

export interface UploadQuestionsResponse {
  inserted: number;
  startSequence: number;
  endSequence: number;
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export async function getQuestionBanks(query: ListQuestionBanksQuery) {
  const params = new URLSearchParams();
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.search) params.append("search", query.search);
  if (query.subjectId) params.append("subjectId", query.subjectId);
  if (query.isActive !== undefined) params.append("isActive", query.isActive.toString());

  const response = await apiClient.get<ApiSuccessResponse<QuestionBank[]>>(
    `/library/question-banks?${params.toString()}`
  );
  return response.data;
}

export async function createQuestionBank(body: CreateQuestionBankInput) {
  const response = await apiClient.post<ApiSuccessResponse<QuestionBank>>(
    "/library/question-banks",
    body
  );
  return response.data;
}

export async function getQuestionBankDetail(bankId: string, page = 1, limit = 20) {
  const response = await apiClient.get<ApiSuccessResponse<QuestionBankDetail>>(
    `/library/question-banks/${bankId}?page=${page}&limit=${limit}`
  );
  return response.data;
}

export async function getSharedQuestionBankDetail(bankId: string, page = 1, limit = 20) {
  const response = await apiClient.get<ApiSuccessResponse<QuestionBankDetail>>(
    `/library/question-banks/shared/${bankId}?page=${page}&limit=${limit}`
  );
  return response.data;
}

export async function updateQuestionBank(bankId: string, body: UpdateQuestionBankInput) {
  const response = await apiClient.patch<ApiSuccessResponse<QuestionBank>>(
    `/library/question-banks/${bankId}`,
    body
  );
  return response.data;
}

export async function createQuestionBankSection(bankId: string, body: CreateSectionInput) {
  const response = await apiClient.post<ApiSuccessResponse<QuestionBankSection>>(
    `/library/question-banks/${bankId}/sections`,
    body
  );
  return response.data;
}

export async function updateQuestionBankSection(
  bankId: string,
  sectionId: string,
  body: UpdateSectionInput
) {
  const response = await apiClient.patch<ApiSuccessResponse<QuestionBankSection>>(
    `/library/question-banks/${bankId}/sections/${sectionId}`,
    body
  );
  return response.data;
}

export async function getSectionQuestions(
  bankId: string,
  sectionId: string,
  page = 1,
  limit = 20
) {
  const response = await apiClient.get<ApiSuccessResponse<{ bankId: string; sectionId: string; questions: Question[] }>>(
    `/library/question-banks/${bankId}/sections/${sectionId}/questions?page=${page}&limit=${limit}`
  );
  return response.data;
}

export async function getSharedSectionQuestions(
  bankId: string,
  sectionId: string,
  page = 1,
  limit = 20
) {
  const response = await apiClient.get<ApiSuccessResponse<{ bankId: string; sectionId: string; questions: Question[] }>>(
    `/library/question-banks/shared/${bankId}/sections/${sectionId}/questions?page=${page}&limit=${limit}`
  );
  return response.data;
}

export async function previewQuestions(bankId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ApiSuccessResponse<PreviewResponse>>(
    `/library/question-banks/${bankId}/questions/preview`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function getPreviewStatus(bankId: string, jobId: string) {
  const response = await apiClient.get<ApiSuccessResponse<PreviewStatusResponse>>(
    `/library/question-banks/${bankId}/questions/preview/${jobId}`
  );
  return response.data;
}

export async function uploadQuestions(bankId: string, body: UploadQuestionsInput) {
  const response = await apiClient.post<ApiSuccessResponse<UploadQuestionsResponse>>(
    `/library/question-banks/${bankId}/questions/upload`,
    body
  );
  return response.data;
}

export async function translateQuestions(bankId: string, texts: string[]) {
  const response = await apiClient.post<ApiSuccessResponse<{ translations: string[] }>>(
    `/library/question-banks/${bankId}/questions/translate`,
    { texts }
  );
  return response.data;
}

export async function updateQuestion(bankId: string, questionId: string, body: any) {
  const response = await apiClient.patch<ApiSuccessResponse<{ success: boolean }>>(
    `/library/question-banks/${bankId}/questions/${questionId}`,
    body
  );
  return response.data;
}

export async function copyQuestion(
  bankId: string,
  questionId: string,
  body: {
    targetBankId: string;
    targetSectionId: string | null;
    originalText: string;
    options: { sequence: number; originalText: string; isCorrect: boolean }[];
    solution?: { originalText: string } | null;
  }
) {
  const response = await apiClient.post<ApiSuccessResponse<{ success: boolean; newQuestionId: string }>>(
    `/library/question-banks/${bankId}/questions/${questionId}/copy`,
    body
  );
  return response.data;
}

export async function reuseQuestion(
  bankId: string,
  questionId: string,
  body: {
    targetBankId: string;
    targetSectionId: string | null;
  }
) {
  const response = await apiClient.post<ApiSuccessResponse<{ success: boolean }>>(
    `/library/question-banks/${bankId}/questions/${questionId}/reuse`,
    body
  );
  return response.data;
}
