import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface Subject {
  id: string;
  name: string;
  type: string;
}

export interface MediaAsset {
  id: string;
  teachingStaffId: string;
  subjectId: string;
  subjectName: string | null;
  name: string;
  type: "NOTE" | "VOD";
  status: string;
  storageUrl: string;
  thumbnail: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListNotesQuery {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
}

export async function getMySubjects() {
  const response = await apiClient.get<ApiSuccessResponse<Subject[]>>(
    "/library/my-subjects"
  );
  return response.data;
}

export async function getMyNotes(filters: ListNotesQuery) {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.search) params.append("search", filters.search);
  if (filters.subjectId) params.append("subjectId", filters.subjectId);

  const response = await apiClient.get<ApiSuccessResponse<MediaAsset[]>>(
    `/library/notes?${params.toString()}`
  );
  return response.data;
}

export interface CreateNoteInput {
  name: string;
  subjectId: string;
  fileKey: string;
  mimeType: string;
  sizeBytes: number;
}

export async function createNote(input: CreateNoteInput) {
  const response = await apiClient.post<ApiSuccessResponse<{ assetId: string; storageUrl: string }>>(
    "/library/notes",
    input
  );
  return response.data;
}

export interface CreateVideoInput {
  name: string;
  subjectId: string;
  thumbnailKey: string;
  videoKey: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number;
}

export async function getMyVideos(filters: ListNotesQuery) {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.search) params.append("search", filters.search);
  if (filters.subjectId) params.append("subjectId", filters.subjectId);

  const response = await apiClient.get<ApiSuccessResponse<MediaAsset[]>>(
    `/library/videos?${params.toString()}`
  );
  return response.data;
}

export async function createVideo(input: CreateVideoInput) {
  const response = await apiClient.post<ApiSuccessResponse<{ assetId: string; storageUrl: string; status: string }>>(
    "/library/videos",
    input
  );
  return response.data;
}

export async function updateNote(noteId: string, name: string) {
  const response = await apiClient.patch<ApiSuccessResponse<{ id: string; name: string }>>(
    `/library/notes/${noteId}`,
    { name }
  );
  return response.data;
}

export async function updateVideo(videoId: string, body: { name?: string; thumbnailKey?: string }) {
  const response = await apiClient.patch<ApiSuccessResponse<{ id: string; name: string }>>(
    `/library/videos/${videoId}`,
    body
  );
  return response.data;
}

export async function deleteMediaAsset(assetId: string) {
  const response = await apiClient.delete<ApiSuccessResponse<{ id: string; status: string }>>(
    `/library/mediaAssets/${assetId}`
  );
  return response.data;
}

export async function getSharedAssetDetail(assetId: string) {
  const response = await apiClient.get<ApiSuccessResponse<MediaAsset & { url: string }>>(
    `/library/mediaAssets/shared/${assetId}`
  );
  return response.data;
}
