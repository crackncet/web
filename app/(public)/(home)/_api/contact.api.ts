import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface ContactQueryInput {
  subject: string;
  message: string;
}

export const submitContactQuery = async (data: ContactQueryInput) => {
  const response = await apiClient.post<ApiSuccessResponse<{ id: string }>>("/queries", data);
  return response.data.data;
};