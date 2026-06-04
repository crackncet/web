import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface Mentors {
  fullName: string;
  profileImage: string | null;
  collegeName: string;
  subjectName: string;
  streamName: string;
}

export interface GetMentorsResponse {
  mentors: Mentors[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export async function getMentors(page = 1, limit = 10): Promise<GetMentorsResponse> {
  const response = await apiClient.get<ApiSuccessResponse<Mentors[]>>("/staffs/mentors", {
    params: { page, limit },
  });
  return {
    mentors: response.data.data,
    pagination: {
      page: response.data.meta?.page ?? page,
      limit: response.data.meta?.limit ?? limit,
      totalPages: response.data.meta?.totalPages ?? 1,
      total: response.data.meta?.total ?? response.data.data.length,
    },
  };
}