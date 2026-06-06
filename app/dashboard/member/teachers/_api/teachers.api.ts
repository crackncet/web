import { apiClient, ApiSuccessResponse } from "@/lib/api-client";
import { TeachingStaff } from "@/app/dashboard/admin/teachers/_api/teachers.api";
import type { GetTeachingStaffFilters } from "@/app/dashboard/admin/teachers/_api/teachers.api";
export type { GetTeachingStaffFilters };

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  profileImage: string | null;
}

export interface Stream {
  id: string;
  name: string;
  hodId?: string;
}

export interface Subject {
  id: string;
  name: string;
  type: string;
}

export interface AssignStaffInput {
  userId: string;
  subjectId: string;
  collegeName: string;
  role: "TEACHER" | "TA";
}

export async function getTeachingStaff(filters: GetTeachingStaffFilters) {
  const params: Record<string, any> = {
    page: filters.page,
    limit: filters.limit,
  };

  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.role) {
    params.role = filters.role;
  }

  // Note: For HODs, streamId is resolved server-side, so we don't pass it.
  const response = await apiClient.get<ApiSuccessResponse<TeachingStaff[]>>("/staffs/teaching", {
    params,
  });

  return {
    data: response.data.data,
    pagination: {
      page: response.data.meta?.page ?? filters.page ?? 1,
      limit: response.data.meta?.limit ?? filters.limit ?? 10,
      totalPages: response.data.meta?.totalPages ?? 1,
      total: response.data.meta?.total ?? response.data.data.length,
    },
  };
}

export async function getCandidates() {
  const response = await apiClient.get<ApiSuccessResponse<Candidate[]>>("/staffs/teaching/candidates");
  return response.data.data;
}

export async function getStreamSubjects(streamId: string) {
  const response = await apiClient.get<ApiSuccessResponse<Subject[]>>(`/metadata/streams/${streamId}/subjects`);
  return response.data.data;
}

export async function assignTeachingStaff(data: AssignStaffInput) {
  const response = await apiClient.post<ApiSuccessResponse<any>>("/staffs/teaching", data);
  return response.data.data;
}
