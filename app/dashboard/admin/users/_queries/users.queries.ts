import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUsers, toggleUserStatus, GetUsersFilters } from "../_api/users.api";

// Centralized cache keys
export const userQueryKeys = {
  all: ["users"] as const,
  list: (filters: GetUsersFilters) => [...userQueryKeys.all, "list", filters] as const,
};

export function useUsersQuery(filters: GetUsersFilters) {
  return useQuery({
    queryKey: userQueryKeys.list(filters),
    queryFn: () => getUsers(filters),
    placeholderData: (previousData) => previousData, // smooth transitions when page changes
  });
}

export function useToggleUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => toggleUserStatus(userId),
    onSuccess: (data) => {
      // Invalidate users list queries
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      toast.success(data.message || "User status updated successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to toggle user status";
      toast.error(message);
    },
  });
}
