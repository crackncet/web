import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeachingStaff,
  getCandidates,
  getStreamSubjects,
  assignTeachingStaff,
  GetTeachingStaffFilters,
} from "../_api/teachers.api";

export const TEACHERS_QUERY_KEYS = {
  all: ["memberTeachingStaff"] as const,
  list: (filters: GetTeachingStaffFilters) => [...TEACHERS_QUERY_KEYS.all, "list", filters] as const,
  candidates: () => [...TEACHERS_QUERY_KEYS.all, "candidates"] as const,
  subjects: (streamId: string) => [...TEACHERS_QUERY_KEYS.all, "subjects", streamId] as const,
};

export function useMemberTeachingStaffQuery(filters: GetTeachingStaffFilters) {
  return useQuery({
    queryKey: TEACHERS_QUERY_KEYS.list(filters),
    queryFn: () => getTeachingStaff(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useCandidatesQuery() {
  return useQuery({
    queryKey: TEACHERS_QUERY_KEYS.candidates(),
    queryFn: getCandidates,
    staleTime: 30000,
  });
}

export function useStreamSubjectsQuery(streamId: string) {
  return useQuery({
    queryKey: TEACHERS_QUERY_KEYS.subjects(streamId),
    queryFn: () => getStreamSubjects(streamId),
    enabled: !!streamId,
    staleTime: 60000,
  });
}

export function useAssignTeachingStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignTeachingStaff,
    onSuccess: () => {
      // Invalidate both HOD (member) and general lists to trigger clean reload
      queryClient.invalidateQueries({ queryKey: TEACHERS_QUERY_KEYS.all });
    },
  });
}
