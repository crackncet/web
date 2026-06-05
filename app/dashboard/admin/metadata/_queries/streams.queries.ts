import { useQuery } from "@tanstack/react-query";
import { getStreams, getStreamById, getStreamSubjects, getTeachingCandidates } from "../_api/streams.api";

export const streamQueryKeys = {
  all: ["streams"] as const,
  list: () => [...streamQueryKeys.all, "list"] as const,
  detail: (streamId: string) => [...streamQueryKeys.all, "detail", streamId] as const,
  subjects: (streamId: string) => [...streamQueryKeys.all, "subjects", streamId] as const,
};

export function useStreamsQuery() {
  return useQuery({
    queryKey: streamQueryKeys.list(),
    queryFn: getStreams,
  });
}

export function useStreamDetailsQuery(streamId: string | null) {
  return useQuery({
    queryKey: streamQueryKeys.detail(streamId || ""),
    queryFn: () => getStreamById(streamId!),
    enabled: !!streamId,
  });
}

export function useStreamSubjectsQuery(streamId: string | null) {
  return useQuery({
    queryKey: streamQueryKeys.subjects(streamId || ""),
    queryFn: () => getStreamSubjects(streamId!),
    enabled: !!streamId,
  });
}

export function useHodCandidatesQuery() {
  return useQuery({
    queryKey: ["staffs", "teaching-candidates"] as const,
    queryFn: () => getTeachingCandidates(),
  });
}
