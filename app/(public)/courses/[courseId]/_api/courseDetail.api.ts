import { apiClient, ApiSuccessResponse } from "@/lib/api-client";
export interface PublicCourseDetail {
  id: string;
  title: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string | null;
  testSeriesId: string | null;
  testSeriesTitle: string | null;
  testSeriesPrice: string | null;
  streams: string[];
  demoVideos?: string[] | null;
  videoDurationMinutes: number;
  testCount: number;
  dppCount: number;
  mentorCount: number;
  videoLectureCount: number;
  liveLectureCount: number;
  topicNotesCount: number;
  chapterNotesCount: number;
  chapterQuestionBankCount: number;
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

export async function getPublicCourseDetail(courseId: string): Promise<PublicCourseDetail> {
  const response = await apiClient.get<ApiSuccessResponse<PublicCourseDetail>>(
    `/courses/public/${courseId}`
  );
  return response.data.data;
}

export async function getPublicCourseMentors(courseId: string): Promise<PublicStreamMentors[]> {
  const response = await apiClient.get<ApiSuccessResponse<PublicStreamMentors[]>>(
    `/courses/public/${courseId}/mentors`
  );
  return response.data.data;
}

export interface PublicTopicOutline {
  topicName: string;
}

export interface PublicChapterOutline {
  chapterName: string;
  topics: PublicTopicOutline[];
}

export interface PublicSubjectOutline {
  subjectName: string;
  chapters: PublicChapterOutline[];
}

export interface PublicStreamOutline {
  streamName: string;
  subjects: PublicSubjectOutline[];
}

export async function getPublicCourseOutline(courseId: string): Promise<PublicStreamOutline[]> {
  const response = await apiClient.get<ApiSuccessResponse<PublicStreamOutline[]>>(
    `/courses/public/${courseId}/outline`
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
