import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface PublicTestSeriesDetail {
  id: string;
  examId: string;
  name: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string | null;
  isEnrollmentOpen: boolean;
  streams: string[];
  testCount: number;
  mentorCount: number;
}

export interface PublicMentor {
  name: string;
  college: string;
  profileImage: string | null;
  role: "TEACHER" | "TA";
}

export interface PublicSubjectMentors {
  subjectId: string;
  subjectName: string;
  mentors: PublicMentor[];
}

export interface PublicStreamMentors {
  streamId: string;
  streamName: string;
  subjects: PublicSubjectMentors[];
}

export async function getPublicTestSeriesDetail(testSeriesId: string): Promise<PublicTestSeriesDetail> {
  const response = await apiClient.get<ApiSuccessResponse<PublicTestSeriesDetail>>(
    `/test-series/public/${testSeriesId}`
  );
  return response.data.data;
}

export async function getPublicTestSeriesMentors(testSeriesId: string): Promise<PublicStreamMentors[]> {
  const response = await apiClient.get<ApiSuccessResponse<PublicStreamMentors[]>>(
    `/test-series/public/${testSeriesId}/mentors`
  );
  return response.data.data;
}

export interface PublicTest {
  name: string;
  scheduledAt: string | null;
}

export interface PublicTestSeriesOutline {
  testSeriesName: string;
  streams: string[];
  tests: PublicTest[];
}

export async function getPublicTestSeriesOutline(testSeriesId: string): Promise<PublicTestSeriesOutline> {
  const response = await apiClient.get<ApiSuccessResponse<PublicTestSeriesOutline>>(
    `/test-series/public/${testSeriesId}/outline`
  );
  return response.data.data;
}

export interface PublicExamDetail {
  id: string;
  name: string;
  enrollmentRules: any;
  currentRulesVersion: number;
}

export async function getPublicExamById(examId: string): Promise<PublicExamDetail> {
  const response = await apiClient.get<ApiSuccessResponse<PublicExamDetail>>(
    `/metadata/public/exams/${examId}`
  );
  return response.data.data;
}
