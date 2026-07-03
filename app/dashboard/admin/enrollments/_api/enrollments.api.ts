import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string | null;
  courseTitle: string | null;
  testSeriesId: string | null;
  testSeriesName: string | null;
  status: "ACTIVE" | "EXPIRED" | "REVOKED" | "SUSPENDED";
  expiresAt: string | null;
  orderId: string;
  providerOrderId: string;
  createdAt: string;
}

export interface GetEnrollmentsResponse {
  data: Enrollment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetEnrollmentsFilters {
  page: number;
  limit: number;
  type?: "COURSE" | "TEST_SERIES" | "";
  courseId?: string;
  testSeriesId?: string;
  status?: "ACTIVE" | "EXPIRED" | "REVOKED" | "SUSPENDED" | "";
  search?: string;
}

export async function getEnrollments(filters: GetEnrollmentsFilters): Promise<GetEnrollmentsResponse> {
  const params: Record<string, any> = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.type) {
    params.type = filters.type;
  }
  if (filters.courseId) {
    params.courseId = filters.courseId;
  }
  if (filters.testSeriesId) {
    params.testSeriesId = filters.testSeriesId;
  }
  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }

  const response = await apiClient.get<ApiSuccessResponse<GetEnrollmentsResponse>>("/enrollments/admin", {
    params,
  });

  return response.data.data;
}

export async function revokeEnrollment(enrollmentId: string) {
  const response = await apiClient.post<ApiSuccessResponse<any>>(
    `/enrollments/admin/${enrollmentId}/revoke`
  );
  return response.data;
}

export async function resumeEnrollment(enrollmentId: string) {
  const response = await apiClient.post<ApiSuccessResponse<any>>(
    `/enrollments/admin/${enrollmentId}/resume`
  );
  return response.data;
}

export async function extendEnrollment(enrollmentId: string, expiresAt: string | null) {
  const response = await apiClient.post<ApiSuccessResponse<any>>(
    `/enrollments/admin/${enrollmentId}/extend`,
    { expiresAt }
  );
  return response.data;
}
