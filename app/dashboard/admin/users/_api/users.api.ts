import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface User {
  id: string;
  fullName: string;
  globalRole: "STUDENT" | "TEAM_MEMBER" | "ADMIN";
  email: string;
  phone: string | null;
  profileImage: string | null;
  isActive: boolean;
}

export interface GetUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export interface GetUsersFilters {
  page: number;
  limit: number;
  query?: string;
  globalRole?: string;
  isActive?: boolean;
}

export async function getUsers(filters: GetUsersFilters) {
  const params: Record<string, any> = {
    page: filters.page,
    limit: filters.limit,
  };
  
  if (filters.query?.trim()) {
    params.query = filters.query.trim();
  }
  if (filters.globalRole) {
    params.globalRole = filters.globalRole;
  }
  if (filters.isActive !== undefined) {
    params.isActive = String(filters.isActive);
  }

  const response = await apiClient.get<ApiSuccessResponse<User[]>>("/users", {
    params,
  });

  return {
    users: response.data.data,
    pagination: {
      page: response.data.meta?.page ?? filters.page ?? 1,
      limit: response.data.meta?.limit ?? filters.limit ?? 10,
      totalPages: response.data.meta?.totalPages ?? 1,
      total: response.data.meta?.total ?? response.data.data.length,
    },
  };
}

export async function toggleUserStatus(userId: string) {
  const response = await apiClient.patch<ApiSuccessResponse<null>>(
    `/users/${userId}/status`
  );
  return response.data;
}