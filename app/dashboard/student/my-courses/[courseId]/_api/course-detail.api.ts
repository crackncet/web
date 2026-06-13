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
}

export interface Chapter {
  chapterId: string;
  courseSubjectId: string;
  serialNumber: number;
  name: string;
  chapterPracticeBankId: string | null;
  notesAssetId: string | null;
  topics: Topic[];
}

export interface SubjectSyllabus {
  courseSubjectId: string;
  subjectId: string;
  subjectName: string;
  subjectType: string;
  chapters: Chapter[];
}

export interface CourseDetailSyllabus {
  course: {
    id: string;
    title: string;
    description: string | null;
    banner: string | null;
  };
  subjects: SubjectSyllabus[];
}

export async function getCourseDetailSyllabus(courseId: string) {
  const response = await apiClient.get<ApiSuccessResponse<CourseDetailSyllabus>>(
    `/classroom/courses/${courseId}`
  );
  return response.data;
}
