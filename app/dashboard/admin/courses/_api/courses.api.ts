import { apiClient, ApiSuccessResponse } from "@/lib/api-client";
import { CourseDetail } from "../../../member/courses/_api/courses.api";

export interface Course {
  id: string;
  examId: string;
  testSeriesId: string | null;
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
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "UNPUBLISHED";
  isFeatured?: boolean;
  streams?: string[];
}

export interface FeaturedCourse {
  id: string;
  examName: string;
  title: string;
  description: string | null;
  banner: string | null;
  price: string;
  startDate: string;
  streams?: string[];
}

export interface ListCourseQuery {
  page?: number;
  limit?: number;
  query?: string;
  examId?: string;
  status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "UNPUBLISHED";
}

export interface CoursesMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  availableStatuses: string[];
}

export async function getAdminCourses(filters: ListCourseQuery = {}) {
  const params: Record<string, string | number> = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.query?.trim()) params.query = filters.query.trim();
  if (filters.examId) params.examId = filters.examId;
  if (filters.status) params.status = filters.status;

  const response = await apiClient.get<ApiSuccessResponse<Course[]>>(
    "/courses/admin-view",
    { params }
  );
  return response.data;
}

export interface CreateCourseInput {
  examId: string;
  title: string;
  description?: string;
  banner?: string;
  price: string;
  startDate?: string;
  endDate?: string;
  testSeriesId?: string;
  streamId: string[];
}

export async function createCourse(data: CreateCourseInput) {
  const response = await apiClient.post<ApiSuccessResponse<Course>>(
    "/courses",
    data
  );
  return response.data;
}

export async function featureCourse(courseId: string) {
  const response = await apiClient.post<ApiSuccessResponse<{ courseId: string; featured: boolean }>>(
    `/courses/${courseId}/featured`
  );
  return response.data;
}

export async function unfeatureCourse(courseId: string) {
  const response = await apiClient.delete<ApiSuccessResponse<{ courseId: string; featured: boolean }>>(
    `/courses/${courseId}/featured`
  );
  return response.data;
}

export async function getFeaturedCourses() {
  const response = await apiClient.get<ApiSuccessResponse<FeaturedCourse[]>>(
    "/courses/featured"
  );
  return response.data;
}

export async function updateCourse(
  courseId: string,
  data: Partial<CreateCourseInput> & { isActive?: boolean; isPublished?: boolean }
) {
  const response = await apiClient.patch<ApiSuccessResponse<Course>>(
    `/courses/${courseId}`,
    data
  );
  return response.data;
}

export async function getCourseDetail(courseId: string) {
  const response = await apiClient.get<ApiSuccessResponse<CourseDetail>>(
    `/courses/${courseId}`
  );
  return response.data;
}
