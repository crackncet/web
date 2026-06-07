import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMySubjects,
  getMyNotes,
  createNote,
  getMyVideos,
  createVideo,
  updateNote,
  updateVideo,
  deleteMediaAsset,
  ListNotesQuery,
} from "../_api/media.api";

export const MEDIA_QUERY_KEYS = {
  all: ["memberMedia"] as const,
  subjects: () => [...MEDIA_QUERY_KEYS.all, "subjects"] as const,
  notesList: (filters: ListNotesQuery) => [...MEDIA_QUERY_KEYS.all, "notesList", filters] as const,
  videosList: (filters: ListNotesQuery) => [...MEDIA_QUERY_KEYS.all, "videosList", filters] as const,
};

export function useMySubjectsQuery() {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.subjects(),
    queryFn: getMySubjects,
    staleTime: 10 * 60 * 1000, // Subjects don't change often
  });
}

export function useMyNotesQuery(filters: ListNotesQuery) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.notesList(filters),
    queryFn: () => getMyNotes(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useMyVideosQuery(filters: ListNotesQuery) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.videosList(filters),
    queryFn: () => getMyVideos(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useCreateNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.all,
      });
    },
  });
}

export function useCreateVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.all,
      });
    },
  });
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, name }: { noteId: string; name: string }) => updateNote(noteId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.all,
      });
    },
  });
}

export function useUpdateVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, name, thumbnailKey }: { videoId: string; name?: string; thumbnailKey?: string }) =>
      updateVideo(videoId, { name, thumbnailKey }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.all,
      });
    },
  });
}

export function useDeleteMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMediaAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.all,
      });
    },
  });
}
