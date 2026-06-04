import { useQuery } from "@tanstack/react-query";
import { getMentors } from "../_api/mentors.api";

export const MENTORS_KEY = ["mentors"];

export function useMentors(page = 1, limit = 10) {
  return useQuery({
    queryKey: [...MENTORS_KEY, page, limit],
    queryFn: () => getMentors(page, limit),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours cache since it's static homepage content
  });
}
