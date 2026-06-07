import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface MemberCourse {
  id: string;
  examId: string;
  examName: string;
  testSeriesId: string | null;
  testSeriesTitle: string | null;
  title: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  streams: string[];
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "UNPUBLISHED";
}

export interface ListCourseQuery {
  page?: number;
  limit?: number;
  query?: string;
  examId?: string;
  status?: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  profileImage: string | null;
  role: "TEACHER" | "TA";
}

export interface SubjectEntry {
  courseSubjectId: string;
  subjectId: string;
  subjectName: string;
  staff: StaffMember[];
}

export interface StreamEntry {
  streamId: string;
  streamName: string;
  subjects: SubjectEntry[];
}

export interface CourseDetail {
  id: string;
  examId: string;
  testSeriesId: string | null;
  title: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  streams: StreamEntry[];
}

export interface Chapter {
  id: string;
  courseSubjectId: string;
  serialNumber: number;
  name: string;
  chapterPracticeBankId: string | null;
  chapterPracticeBankTitle?: string | null;
  notesAssetId: string | null;
  notesAssetName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  chapterId: string;
  serialNumber: number;
  name: string;
  videoLectureId: string | null;
  liveLectureId: string | null;
  notesAssetId: string | null;
  dppBankId: string | null;
  scheduledUnlockAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterWithTopics extends Chapter {
  topics: Topic[];
}

export interface MetadataSubject {
  id: string;
  name: string;
  type: "CORE" | "ELECTIVE";
  isActive: boolean;
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

export async function getMemberCourses(filters: ListCourseQuery) {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.query) params.append("query", filters.query);
  if (filters.examId) params.append("examId", filters.examId);
  if (filters.status) params.append("status", filters.status);

  const response = await apiClient.get<ApiSuccessResponse<MemberCourse[]>>(
    `/courses/member-view?${params.toString()}`
  );
  return response.data;
}

export async function getCourseDetail(courseId: string) {
  const response = await apiClient.get<ApiSuccessResponse<CourseDetail>>(
    `/courses/${courseId}`
  );
  return response.data;
}

export async function addSubjectsFaculty(
  courseId: string,
  streamId: string,
  staffIds: string[]
) {
  const response = await apiClient.post<ApiSuccessResponse<null>>(
    `/courses/${courseId}/streams/${streamId}/subjects`,
    { staff: staffIds }
  );
  return response.data;
}

export async function getStreamSubjects(streamId: string) {
  const response = await apiClient.get<ApiSuccessResponse<MetadataSubject[]>>(
    `/metadata/streams/${streamId}/subjects`
  );
  return response.data;
}

export async function getTeachingStaffList(filters: { streamId?: string }) {
  const params = new URLSearchParams();
  if (filters.streamId) params.append("streamId", filters.streamId);

  const response = await apiClient.get<ApiSuccessResponse<TeachingStaffListItem[]>>(
    `/staffs/teaching?${params.toString()}`
  );
  return response.data;
}

export async function getChapters(courseId: string, courseSubjectId: string) {
  const response = await apiClient.get<ApiSuccessResponse<Chapter[]>>(
    `/courses/${courseId}/subjects/${courseSubjectId}/chapters`
  );
  return response.data;
}

export async function createChapter(
  courseId: string,
  courseSubjectId: string,
  data: { name: string; serialNumber: number; chapterPracticeBankId?: string; notesAssetId?: string }
) {
  const response = await apiClient.post<ApiSuccessResponse<Chapter>>(
    `/courses/${courseId}/subjects/${courseSubjectId}/chapters`,
    data
  );
  return response.data;
}

export async function updateChapter(
  courseId: string,
  courseSubjectId: string,
  chapterId: string,
  data: { name?: string; serialNumber?: number }
) {
  const response = await apiClient.patch<ApiSuccessResponse<Chapter>>(
    `/courses/${courseId}/subjects/${courseSubjectId}/chapters/${chapterId}`,
    data
  );
  return response.data;
}

export async function updateChapterMaterials(
  courseId: string,
  courseSubjectId: string,
  chapterId: string,
  data: { chapterPracticeBankId?: string | null; notesAssetId?: string | null }
) {
  const response = await apiClient.patch<ApiSuccessResponse<Chapter>>(
    `/courses/${courseId}/subjects/${courseSubjectId}/chapters/${chapterId}/materials`,
    data
  );
  return response.data;
}

export async function getChapterWithTopics(
  courseId: string,
  courseSubjectId: string,
  chapterId: string
) {
  const response = await apiClient.get<ApiSuccessResponse<ChapterWithTopics>>(
    `/courses/${courseId}/subjects/${courseSubjectId}/chapters/${chapterId}`
  );
  return response.data;
}

export async function createTopic(
  courseId: string,
  courseSubjectId: string,
  chapterId: string,
  data: { name: string; serialNumber: number; scheduledUnlockAt?: string | null }
) {
  const response = await apiClient.post<ApiSuccessResponse<Topic>>(
    `/courses/${courseId}/subjects/${courseSubjectId}/chapters/${chapterId}/topics`,
    data
  );
  return response.data;
}

export async function updateTopic(
  courseId: string,
  courseSubjectId: string,
  chapterId: string,
  topicId: string,
  data: { name?: string; serialNumber?: number; scheduledUnlockAt?: string | null }
) {
  const response = await apiClient.patch<ApiSuccessResponse<Topic>>(
    `/courses/${courseId}/subjects/${courseSubjectId}/chapters/${chapterId}/topics/${topicId}`,
    data
  );
  return response.data;
}

export async function updateTopicMaterials(
  courseId: string,
  courseSubjectId: string,
  chapterId: string,
  topicId: string,
  data: {
    videoLectureId?: string | null;
    liveLectureId?: string | null;
    notesAssetId?: string | null;
    dppBankId?: string | null;
  }
) {
  const response = await apiClient.patch<ApiSuccessResponse<Topic>>(
    `/courses/${courseId}/subjects/${courseSubjectId}/chapters/${chapterId}/topics/${topicId}/materials`,
    data
  );
  return response.data;
}

export interface CourseSubjectDetail {
  courseId: string;
  courseName: string;
  courseSubjectId: string;
  subjectId: string;
  subjectName: string;
  streamId: string;
  streamName: string;
  staff: {
    id: string;
    fullName: string;
    profileImage: string | null;
    role: "TEACHER" | "TA";
  }[];
}

export async function getSubjectDetail(courseId: string, courseSubjectId: string) {
  const response = await apiClient.get<ApiSuccessResponse<CourseSubjectDetail>>(
    `/courses/${courseId}/subjects/${courseSubjectId}`
  );
  return response.data;
}

export interface LibraryNote {
  id: string;
  name: string;
  subjectId: string;
  type: "NOTE";
  status: string;
  createdAt: string;
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

export async function getLibraryNotes(subjectId: string) {
  const response = await apiClient.get<ApiSuccessResponse<LibraryNote[]>>(
    `/library/notes?subjectId=${subjectId}&limit=100`
  );
  return response.data;
}

export async function getLibraryQuestionBanks(subjectId: string) {
  const response = await apiClient.get<ApiSuccessResponse<LibraryQuestionBank[]>>(
    `/library/question-banks?subjectId=${subjectId}&limit=100`
  );
  return response.data;
}

export interface LibraryVideo {
  id: string;
  name: string;
  subjectId: string;
  type: "VOD";
  status: string;
  createdAt: string;
}

export async function getLibraryVideos(subjectId: string) {
  const response = await apiClient.get<ApiSuccessResponse<LibraryVideo[]>>(
    `/library/videos?subjectId=${subjectId}&limit=100`
  );
  return response.data;
}

export interface LibraryLiveLecture {
  id: string;
  title: string;
  subjectId: string;
  status: string;
  scheduledStartTime: string | null;
  createdAt: string;
}

export async function getLibraryLiveLectures(subjectId: string) {
  const response = await apiClient.get<ApiSuccessResponse<LibraryLiveLecture[]>>(
    `/library/live-lectures?subjectId=${subjectId}&limit=100`
  );
  return response.data;
}

export interface TopicDetail {
  id: string;
  serialNumber: number;
  name: string;
  scheduledUnlockAt: string | null;
  videoLectureId: string | null;
  videoLectureTitle: string | null;
  videoLectureStatus: string | null;
  notesAssetId: string | null;
  notesAssetTitle: string | null;
  liveLectureId: string | null;
  liveLectureTitle: string | null;
  liveLectureStatus: string | null;
  dppBankId: string | null;
  dppBankTitle: string | null;
}

export async function getTopicDetail(
  courseId: string,
  courseSubjectId: string,
  chapterId: string,
  topicId: string
) {
  const response = await apiClient.get<ApiSuccessResponse<TopicDetail>>(
    `/courses/${courseId}/subjects/${courseSubjectId}/chapters/${chapterId}/topics/${topicId}`
  );
  return response.data;
}


