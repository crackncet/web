import { apiClient } from "@/lib/api-client";
import { Doubt, DoubtDetailResponse, DoubtResponse, Subject } from "../../../student/doubts/_api/doubts.api";

export interface GetTeacherQueueFilters {
  page: number;
  limit: number;
  status?: "UNASSIGNED" | "CLAIMED";
  subjectId?: string;
}

export interface GetTeacherQueueResponse {
  data: Doubt[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const memberDoubtsApi = {
  getTeacherQueue: async (
    filters: GetTeacherQueueFilters
  ): Promise<GetTeacherQueueResponse> => {
    const response = await apiClient.get<GetTeacherQueueResponse>(
      "/classroom/doubts/teacher/queue",
      { params: filters }
    );
    return response.data;
  },

  claimDoubt: async (doubtId: string): Promise<Doubt> => {
    const response = await apiClient.post<{ data: Doubt }>(
      `/classroom/doubts/${doubtId}/claim`
    );
    return response.data.data;
  },

  getDoubtDetail: async (doubtId: string): Promise<DoubtDetailResponse> => {
    const response = await apiClient.get<{ data: DoubtDetailResponse }>(
      `/classroom/doubts/${doubtId}`
    );
    return response.data.data;
  },

  addResponse: async (
    doubtId: string,
    payload: { content: string; imageUrl?: string | null }
  ): Promise<DoubtResponse> => {
    const response = await apiClient.post<{ data: DoubtResponse }>(
      `/classroom/doubts/${doubtId}/responses`,
      payload
    );
    return response.data.data;
  },

  resolveDoubt: async (doubtId: string): Promise<Doubt> => {
    const response = await apiClient.patch<{ data: Doubt }>(
      `/classroom/doubts/${doubtId}/resolve`
    );
    return response.data.data;
  },
};
