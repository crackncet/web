import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface EnrolledCourse {
  enrollmentId: string;
  courseId: string;
  title: string;
  description: string | null;
  banner: string | null;
  examName: string;
  enrolledAt: string;
}

export async function getMyCourses() {
  const response = await apiClient.get<ApiSuccessResponse<EnrolledCourse[]>>(
    "/classroom/courses"
  );
  return response.data;
}
