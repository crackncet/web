import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface TestSeries {
  id: string;
  examId: string;
  examName: string;
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

export async function getMemberTestSeries(filters: ListTestSeriesQuery = {}) {
  const params: Record<string, string | number> = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.query?.trim()) params.query = filters.query.trim();
  if (filters.examId) params.examId = filters.examId;
  if (filters.status) params.status = filters.status;

  const response = await apiClient.get<ApiSuccessResponse<TestSeries[]>>(
    "/test-series/member-view",
    { params }
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

export async function getMemberTestSeriesDetail(testSeriesId: string) {
  const response = await apiClient.get<ApiSuccessResponse<TestSeriesDetail>>(
    `/test-series/${testSeriesId}/info`
  );
  return response.data;
}

export async function getMemberTestSeriesTests(testSeriesId: string, query: { page?: number; limit?: number } = {}) {
  const params: Record<string, string | number> = {};
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;

  const response = await apiClient.get<ApiSuccessResponse<TestSeriesTest[]>>(
    `/test-series/${testSeriesId}/tests`,
    { params }
  );
  return response.data;
}

export interface TeachingStaffListItem {
  id: string;
  role: "TEACHER" | "TA";
  collegeName: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    profileImage: string | null;
  };
  subject: {
    id: string;
    name: string;
    type: string;
  };
  stream: {
    id: string;
    name: string;
  };
}

export async function getMemberTeachingStaffList(filters: { role?: "TEACHER" | "TA" } = {}) {
  const params = new URLSearchParams();
  if (filters.role) params.append("role", filters.role);

  const response = await apiClient.get<ApiSuccessResponse<TeachingStaffListItem[]>>(
    `/staffs/teaching?${params.toString()}`
  );
  return response.data;
}

export async function addMemberSubjectsFaculty(
  testSeriesId: string,
  streamId: string,
  teachingStaffIds: string[]
) {
  const response = await apiClient.post<ApiSuccessResponse<null>>(
    `/test-series/${testSeriesId}/streams/${streamId}/subjects-faculty`,
    { teachingStaffIds }
  );
  return response.data;
}

export interface TestSubject {
  subjectId: string;
  subjectName: string;
  sectionId: string | null;
  maxQuestionsToAttempt: number | null;
  isOptional: boolean;
  questionBank: {
    id: string;
    title: string;
    isActive: boolean;
  } | null;
}

export interface LibraryQuestionBank {
  id: string;
  subjectId: string;
  subjectName: string | null;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getMemberTestSubjects(testSeriesId: string, testId: string) {
  const response = await apiClient.get<ApiSuccessResponse<TestSubject[]>>(
    `/test-series/${testSeriesId}/tests/${testId}/subjects`
  );
  return response.data;
}

export async function addMemberQuestionBank(
  testSeriesId: string,
  testId: string,
  subjectId: string,
  data: {
    questionBankId: string;
    sectionId?: string | null;
    maxQuestionsToAttempt?: number | null;
    isOptional?: boolean;
  }
) {
  const response = await apiClient.post<ApiSuccessResponse<null>>(
    `/test-series/${testSeriesId}/tests/${testId}/subjects/${subjectId}/addQuestionBank`,
    data
  );
  return response.data;
}

export async function getLibraryQuestionBanks(subjectId: string, search?: string) {
  const params: Record<string, string | number> = {
    subjectId,
    limit: 3,
    isActive: "true",
  };
  if (search?.trim()) {
    params.search = search.trim();
  }

  const response = await apiClient.get<ApiSuccessResponse<LibraryQuestionBank[]>>(
    "/library/question-banks",
    { params }
  );
  return response.data;
}

export interface TestSection {
  id: string;
  testId: string;
  name: string;
  sequence: number;
  rules: any;
  createdAt: string;
  updatedAt: string;
}

export async function getMemberTestSections(testSeriesId: string, testId: string) {
  const response = await apiClient.get<ApiSuccessResponse<TestSection[]>>(
    `/test-series/${testSeriesId}/tests/${testId}/sections`
  );
  return response.data;
}

export async function createMemberTestSection(
  testSeriesId: string,
  testId: string,
  data: { name: string; sequence: number }
) {
  const response = await apiClient.post<ApiSuccessResponse<TestSection>>(
    `/test-series/${testSeriesId}/tests/${testId}/sections`,
    data
  );
  return response.data;
}

export async function updateMemberTestSection(
  testSeriesId: string,
  testId: string,
  sectionId: string,
  data: { name?: string; sequence?: number }
) {
  const response = await apiClient.put<ApiSuccessResponse<TestSection>>(
    `/test-series/${testSeriesId}/tests/${testId}/sections/${sectionId}`,
    data
  );
  return response.data;
}

export async function deleteMemberTestSection(
  testSeriesId: string,
  testId: string,
  sectionId: string
) {
  const response = await apiClient.delete<ApiSuccessResponse<TestSection>>(
    `/test-series/${testSeriesId}/tests/${testId}/sections/${sectionId}`
  );
  return response.data;
}

