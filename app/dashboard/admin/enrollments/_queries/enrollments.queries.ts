import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getEnrollments,
  revokeEnrollment,
  resumeEnrollment,
  extendEnrollment,
  GetEnrollmentsFilters,
} from "../_api/enrollments.api";

export const enrollmentQueryKeys = {
  all: ["admin-enrollments"] as const,
  list: (filters: GetEnrollmentsFilters) => [...enrollmentQueryKeys.all, "list", filters] as const,
};

export function useEnrollmentsQuery(filters: GetEnrollmentsFilters) {
  return useQuery({
    queryKey: enrollmentQueryKeys.list(filters),
    queryFn: () => getEnrollments(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useRevokeEnrollmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => revokeEnrollment(enrollmentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.all });
      toast.success(data.message || "Enrollment revoked successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Failed to revoke enrollment";
      toast.error(message);
    },
  });
}

export function useResumeEnrollmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => resumeEnrollment(enrollmentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.all });
      toast.success(data.message || "Enrollment resumed successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Failed to resume enrollment";
      toast.error(message);
    },
  });
}

export function useExtendEnrollmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, expiresAt }: { enrollmentId: string; expiresAt: string | null }) =>
      extendEnrollment(enrollmentId, expiresAt),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: enrollmentQueryKeys.all });
      toast.success(data.message || "Enrollment validity updated successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Failed to extend enrollment validity";
      toast.error(message);
    },
  });
}
