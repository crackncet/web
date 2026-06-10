import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface TestSeries {
  id: string;
  examId: string;
  name: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "UNPUBLISHED";
  streams?: string[];
  streamIds?: string[];
}

export interface ListTestSeriesQuery {
  page?: number;
  limit?: number;
  query?: string;
  examId?: string;
  status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "UNPUBLISHED";
}

export interface CreateTestSeriesInput {
  examId: string;
  name: string;
  description?: string;
  banner?: string;
  price: string;
  startDate?: string;
  endDate?: string;
  isPublished?: boolean;
  streamId: string[];
}

export async function getAdminTestSeries(filters: ListTestSeriesQuery = {}) {
  const params: Record<string, string | number> = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.query?.trim()) params.query = filters.query.trim();
  if (filters.examId) params.examId = filters.examId;
  if (filters.status) params.status = filters.status;

  const response = await apiClient.get<ApiSuccessResponse<TestSeries[]>>(
    "/test-series/admin-view",
    { params }
  );
  return response.data;
}

export async function createTestSeries(data: CreateTestSeriesInput) {
  const response = await apiClient.post<ApiSuccessResponse<TestSeries>>(
    "/test-series",
    data
  );
  return response.data;
}

export interface UpdateTestSeriesInput {
  examId?: string;
  name?: string;
  description?: string | null;
  banner?: string | null;
  price?: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  isPublished?: boolean;
  streamId?: string[];
}

export async function updateTestSeries(testSeriesId: string, data: UpdateTestSeriesInput) {
  const response = await apiClient.patch<ApiSuccessResponse<TestSeries>>(
    `/test-series/${testSeriesId}/info`,
    data
  );
  return response.data;
}

export interface TestSeriesStreamSubjectTeacher {
  id: string;
  fullName: string;
  profileImage: string | null;
}

export interface TestSeriesStreamSubject {
  subjectId: string;
  subjectName: string;
  teacher: TestSeriesStreamSubjectTeacher | null;
}

export interface TestSeriesStreamDetail {
  streamId: string;
  streamName: string;
  subjects: TestSeriesStreamSubject[];
}

export interface TestSeriesDetail extends Omit<TestSeries, "status" | "streams" | "streamIds"> {
  streams: TestSeriesStreamDetail[];
}

export interface TestSeriesTest {
  id: string;
  name: string;
  description: string | null;
  scheduledAt: string | null;
  durationMinutes: number | null;
}

export interface CreateTestsInput {
  tests: {
    name: string;
    description?: string;
    scheduledAt: string; // ISO date string
    durationMinutes: number;
  }[];
}

export async function getTestSeriesDetail(testSeriesId: string) {
  const response = await apiClient.get<ApiSuccessResponse<TestSeriesDetail>>(
    `/test-series/${testSeriesId}/info`
  );
  return response.data;
}

export async function getTestSeriesTests(testSeriesId: string, query: { page?: number; limit?: number } = {}) {
  const params: Record<string, string | number> = {};
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;

  const response = await apiClient.get<ApiSuccessResponse<TestSeriesTest[]>>(
    `/test-series/${testSeriesId}/tests`,
    { params }
  );
  return response.data;
}

export async function addTestSeriesTests(testSeriesId: string, data: CreateTestsInput) {
  const response = await apiClient.post<ApiSuccessResponse<TestSeriesTest[]>>(
    `/test-series/${testSeriesId}/tests`,
    data
  );
  return response.data;
}

