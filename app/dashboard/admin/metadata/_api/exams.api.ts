import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface Exam {
  id: string;
  name: string;
  isActive: boolean;
}

export interface GetExamsFilters {
  search?: string;
  isActive?: boolean;
}

export async function getExams(filters: GetExamsFilters = {}) {
  const params: Record<string, string> = {};
  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.isActive !== undefined) {
    params.isActive = String(filters.isActive);
  }

  const response = await apiClient.get<ApiSuccessResponse<Exam[]>>(
    "/metadata/exams",
    { params }
  );
  return response.data.data;
}

export interface ExamDetails extends Exam {
  enrollmentRules: any;
  currentRulesVersion: number;
}

export async function getExamById(examId: string) {
  const response = await apiClient.get<ApiSuccessResponse<ExamDetails>>(
    `/metadata/exams/${examId}`
  );
  return response.data.data;
}

export async function createExam(name: string) {
  const response = await apiClient.post<ApiSuccessResponse<Exam>>(
    "/metadata/exams",
    { name }
  );
  return response.data;
}

export async function deleteExam(examId: string) {
  const response = await apiClient.delete<ApiSuccessResponse<Exam>>(
    `/metadata/exams/${examId}`
  );
  return response.data;
}