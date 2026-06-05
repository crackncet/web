import { useQuery } from "@tanstack/react-query";
import { getTeachingStaff, GetTeachingStaffFilters } from "../_api/teachers.api";

export const teachersQueryKeys = {
  all: ["teaching-staff"] as const,
  list: (filters: GetTeachingStaffFilters) => [...teachersQueryKeys.all, "list", filters] as const,
};

export function useTeachingStaffQuery(filters: GetTeachingStaffFilters) {
  return useQuery({
    queryKey: teachersQueryKeys.list(filters),
    queryFn: () => getTeachingStaff(filters),
    placeholderData: (previousData) => previousData,
  });
}
