import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface Topic {
  topicId: string;
  chapterId: string;
  serialNumber: number;
  name: string;
  videoLectureId: string | null;
  liveLectureId: string | null;
  notesAssetId: string | null;
  dppBankId: string | null;
  scheduledUnlockAt: string | null;
  isVideoCompleted?: boolean;
  isDppCompleted?: boolean;
}

export interface Chapter {
  chapterId: string;
  courseSubjectId: string;
  serialNumber: number;
  name: string;
  chapterPracticeBankId: string | null;
  notesAssetId: string | null;
  topics: Topic[];
  isChapterPracticeCompleted?: boolean;
  progressPercentage?: number;
  stats?: {
    videos: { total: number; completed: number };
    dpps: { total: number; completed: number };
    chapterPractice: {
      hasPractice: boolean;
      completed: boolean;
    };
  };
}

export interface SubjectSyllabus {
  courseSubjectId: string;
  subjectId: string;
  subjectName: string;
  subjectType: string;
  chapters: Chapter[];
  progressPercentage?: number;
  stats?: {
    videos: { total: number; completed: number };
    dpps: { total: number; completed: number };
    chapterPractices: { total: number; completed: number };
  };
}

export interface CourseDetailSyllabus {
  course: {
    id: string;
    title: string;
    description: string | null;
    banner: string | null;
  };
  overallProgressPercentage?: number;
  stats?: {
    videos: { total: number; completed: number };
    dpps: { total: number; completed: number };
    chapterPractices: { total: number; completed: number };
  };
  subjects: SubjectSyllabus[];
}

export async function getCourseDetailSyllabus(courseId: string) {
  const response = await apiClient.get<ApiSuccessResponse<CourseDetailSyllabus>>(
    `/classroom/progress/course/${courseId}`
  );
  return response.data;
}

export async function toggleVideoProgress(body: {
  topicId: string;
  videoAssetId: string;
  isCompleted: boolean;
}) {
  const response = await apiClient.post<
    ApiSuccessResponse<{ success: boolean; isCompleted: boolean }>
  >("/classroom/progress/video/toggle", body);
  return response.data;
}
