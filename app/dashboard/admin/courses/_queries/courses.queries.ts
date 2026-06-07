import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAdminCourses, 
  createCourse, 
  featureCourse, 
  unfeatureCourse, 
  getFeaturedCourses, 
  updateCourse,
  getCourseDetail,
  ListCourseQuery, 
  CreateCourseInput 
} from "../_api/courses.api";
import { toast } from "sonner";

export const COURSE_QUERY_KEYS = {
  all: ["adminCourses"] as const,
  list: (filters: ListCourseQuery) => [...COURSE_QUERY_KEYS.all, "list", filters] as const,
  featured: () => ["featuredCourses"] as const,
};

export function useAdminCoursesQuery(filters: ListCourseQuery) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.list(filters),
    queryFn: () => getAdminCourses(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseInput) => createCourse(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
      toast.success(res.message || "Course created successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to create course";
      toast.error(message);
    },
  });
}

export function useUpdateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: any }) => updateCourse(courseId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.featured() });
      toast.success(res.message || "Course updated successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to update course";
      toast.error(message);
    },
  });
}

export function useFeatureCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => featureCourse(courseId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.featured() });
      toast.success(res.message || "Course featured successfully");
    },
    onError: (error: any) => {
      const message = error.message || "Failed to feature course";
      toast.error(message);
    },
  });
}

export function useUnfeatureCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => unfeatureCourse(courseId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.featured() });
      toast.success(res.message || "Course removed from featured list");
    },
    onError: (error: any) => {
      const message = error.message || "Failed to remove course from featured list";
      toast.error(message);
    },
  });
}

export function useFeaturedCoursesQuery() {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.featured(),
    queryFn: () => getFeaturedCourses(),
    staleTime: 10000,
  });
}

export function useCourseDetailQuery(courseId: string) {
  return useQuery({
    queryKey: ["adminCourses", "detail", courseId],
    queryFn: () => getCourseDetail(courseId),
    enabled: !!courseId,
    staleTime: 10000,
  });
}
