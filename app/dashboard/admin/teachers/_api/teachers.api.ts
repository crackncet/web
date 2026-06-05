import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface TeachingStaff {
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

export interface GetTeachingStaffFilters {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  streamId?: string;
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
  if (filters.streamId) {
    params.streamId = filters.streamId;
  }

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
