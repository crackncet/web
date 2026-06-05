import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface Stream {
  id: string;
  name: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  profileImage: string | null;
}

export interface StreamDetails {
  id: string;
  name: string;
  hod: {
    fullName: string;
    email: string;
    phone: string | null;
    profileImage: string | null;
    globalRole: string;
    isActive: boolean;
  } | null;
}

export interface Subject {
  id: string;
  name: string;
  type: "DOMAIN" | "NON_DOMAIN" | "LANGUAGE";
  isActive: boolean;
  creator?: {
    fullName: string;
    email: string;
    phone: string | null;
    profileImage: string | null;
    globalRole: string;
    isActive: boolean;
  } | null;
}

export async function getStreams() {
  const response = await apiClient.get<ApiSuccessResponse<Stream[]>>("/metadata/streams");
  return response.data.data;
}

export async function getStreamById(streamId: string) {
  const response = await apiClient.get<ApiSuccessResponse<StreamDetails>>(`/metadata/streams/${streamId}`);
  return response.data.data;
}

export async function createStream(name: string, hodId?: string) {
  const response = await apiClient.post<ApiSuccessResponse<Stream>>("/metadata/streams", {
    name,
    hodId: hodId || undefined,
  });
  return response.data;
}

export async function updateStream(
  streamId: string,
  data: { isActive?: boolean; hodId?: string | null }
) {
  const response = await apiClient.patch<ApiSuccessResponse<Stream>>(`/metadata/streams/${streamId}`, data);
  return response.data;
}

export async function deleteStream(streamId: string) {
  const response = await apiClient.delete<ApiSuccessResponse<Stream>>(`/metadata/streams/${streamId}`);
  return response.data;
}

export async function getStreamSubjects(streamId: string) {
  const response = await apiClient.get<ApiSuccessResponse<Subject[]>>(`/metadata/streams/${streamId}/subjects`);
  return response.data.data;
}

export async function createSubject(streamId: string, name: string, type: "DOMAIN" | "NON_DOMAIN" | "LANGUAGE") {
  const response = await apiClient.post<ApiSuccessResponse<Subject>>("/metadata/subjects", {
    streamId,
    name,
    type,
  });
  return response.data;
}

export async function activateSubject(subjectId: string) {
  const response = await apiClient.patch<ApiSuccessResponse<Subject>>(`/metadata/subjects/${subjectId}`);
  return response.data;
}

export async function deleteSubject(subjectId: string) {
  const response = await apiClient.delete<ApiSuccessResponse<Subject>>(`/metadata/subjects/${subjectId}`);
  return response.data;
}

export async function getTeachingCandidates(search?: string) {
  const params: Record<string, any> = {
    page: 1,
    limit: 100,
  };
  if (search) {
    params.search = search;
  }
  const response = await apiClient.get<ApiSuccessResponse<Candidate[]>>("/staffs/teaching/candidates", {
    params,
  });
  return response.data.data;
}
