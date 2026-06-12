import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMemberCourses,
  getCourseDetail,
  addSubjectsFaculty,
  getStreamSubjects,
  getTeachingStaffList,
  getChapters,
  createChapter,
  updateChapter,
  updateChapterMaterials,
  getChapterWithTopics,
  createTopic,
  updateTopic,
  updateTopicMaterials,
  getSubjectDetail,
  getLibraryNotes,
  getLibraryQuestionBanks,
  getLibraryVideos,
  getLibraryLiveLectures,
  getTopicDetail,
  ListCourseQuery,
} from "../_api/courses.api";
import { toast } from "sonner";

export const MEMBER_COURSE_QUERY_KEYS = {
  all: ["memberCourses"] as const,
  list: (filters: ListCourseQuery) => [...MEMBER_COURSE_QUERY_KEYS.all, "list", filters] as const,
  detail: (courseId: string) => [...MEMBER_COURSE_QUERY_KEYS.all, "detail", courseId] as const,
  streamSubjects: (streamId: string) => ["streamSubjects", streamId] as const,
  teachingStaff: (streamId?: string) => ["teachingStaff", streamId] as const,
  subjectDetail: (courseId: string, courseSubjectId: string) => [...MEMBER_COURSE_QUERY_KEYS.all, "subjectDetail", courseId, courseSubjectId] as const,
  chapters: (courseId: string, courseSubjectId: string) => [...MEMBER_COURSE_QUERY_KEYS.all, "chapters", courseId, courseSubjectId] as const,
  chapterWithTopics: (courseId: string, courseSubjectId: string, chapterId: string) => [
    ...MEMBER_COURSE_QUERY_KEYS.all,
    "chapterWithTopics",
    courseId,
    courseSubjectId,
    chapterId,
  ] as const,
  libraryNotes: (subjectId: string) => ["libraryNotes", subjectId] as const,
  libraryQuestionBanks: (subjectId: string) => ["libraryQuestionBanks", subjectId] as const,
  libraryVideos: (subjectId: string) => ["libraryVideos", subjectId] as const,
  libraryLiveLectures: (subjectId: string) => ["libraryLiveLectures", subjectId] as const,
  topicDetail: (courseId: string, courseSubjectId: string, chapterId: string, topicId: string) => [
    ...MEMBER_COURSE_QUERY_KEYS.all,
    "topicDetail",
    courseId,
    courseSubjectId,
    chapterId,
    topicId,
  ] as const,
};

export function useMemberCoursesQuery(filters: ListCourseQuery) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.list(filters),
    queryFn: () => getMemberCourses(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useCourseDetailQuery(courseId: string) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.detail(courseId),
    queryFn: () => getCourseDetail(courseId),
    staleTime: 10000,
  });
}

export function useAddSubjectsFacultyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      streamId,
      staffIds,
    }: {
      courseId: string;
      streamId: string;
      staffIds: string[];
    }) => addSubjectsFaculty(courseId, streamId, staffIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_COURSE_QUERY_KEYS.detail(variables.courseId),
      });
      toast.success("Subjects and staff added successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to add subjects and faculty";
      toast.error(message);
    },
  });
}

export function useStreamSubjectsQuery(streamId: string, enabled = true) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.streamSubjects(streamId),
    queryFn: () => getStreamSubjects(streamId),
    enabled: !!streamId && enabled,
    staleTime: 60000,
  });
}

export function useTeachingStaffListQuery(streamId?: string, search?: string, enabled = true) {
  return useQuery({
    queryKey: [...MEMBER_COURSE_QUERY_KEYS.teachingStaff(streamId), search],
    queryFn: () => getTeachingStaffList({ streamId, search }),
    enabled: enabled,
    staleTime: 5000,
  });
}

export function useChaptersQuery(courseId: string, courseSubjectId: string, enabled = true) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.chapters(courseId, courseSubjectId),
    queryFn: () => getChapters(courseId, courseSubjectId),
    enabled: !!courseId && !!courseSubjectId && enabled,
    staleTime: 5000,
  });
}

export function useCreateChapterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      courseSubjectId,
      data,
    }: {
      courseId: string;
      courseSubjectId: string;
      data: { name: string; serialNumber: number; chapterPracticeBankId?: string; notesAssetId?: string };
    }) => createChapter(courseId, courseSubjectId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_COURSE_QUERY_KEYS.chapters(variables.courseId, variables.courseSubjectId),
      });
      toast.success("Chapter created successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to create chapter";
      toast.error(message);
    },
  });
}

export function useUpdateChapterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      courseSubjectId,
      chapterId,
      data,
    }: {
      courseId: string;
      courseSubjectId: string;
      chapterId: string;
      data: { name?: string; serialNumber?: number };
    }) => updateChapter(courseId, courseSubjectId, chapterId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_COURSE_QUERY_KEYS.chapters(variables.courseId, variables.courseSubjectId),
      });
      queryClient.invalidateQueries({
        queryKey: MEMBER_COURSE_QUERY_KEYS.chapterWithTopics(variables.courseId, variables.courseSubjectId, variables.chapterId),
      });
      toast.success("Chapter updated successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to update chapter";
      toast.error(message);
    },
  });
}

export function useUpdateChapterMaterialsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      courseSubjectId,
      chapterId,
      data,
    }: {
      courseId: string;
      courseSubjectId: string;
      chapterId: string;
      data: { chapterPracticeBankId?: string | null; notesAssetId?: string | null };
    }) => updateChapterMaterials(courseId, courseSubjectId, chapterId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_COURSE_QUERY_KEYS.chapters(variables.courseId, variables.courseSubjectId),
      });
      queryClient.invalidateQueries({
        queryKey: MEMBER_COURSE_QUERY_KEYS.chapterWithTopics(variables.courseId, variables.courseSubjectId, variables.chapterId),
      });
      toast.success("Chapter materials updated successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to update chapter materials";
      toast.error(message);
    },
  });
}

export function useChapterWithTopicsQuery(
  courseId: string,
  courseSubjectId: string,
  chapterId: string,
  enabled = true
) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.chapterWithTopics(courseId, courseSubjectId, chapterId),
    queryFn: () => getChapterWithTopics(courseId, courseSubjectId, chapterId),
    enabled: !!courseId && !!courseSubjectId && !!chapterId && enabled,
    staleTime: 5000,
  });
}

export function useCreateTopicMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      courseSubjectId,
      chapterId,
      data,
    }: {
      courseId: string;
      courseSubjectId: string;
      chapterId: string;
      data: { name: string; serialNumber: number; scheduledUnlockAt?: string | null };
    }) => createTopic(courseId, courseSubjectId, chapterId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_COURSE_QUERY_KEYS.chapterWithTopics(variables.courseId, variables.courseSubjectId, variables.chapterId),
      });
      toast.success("Topic created successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to create topic";
      toast.error(message);
    },
  });
}

export function useUpdateTopicMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      courseSubjectId,
      chapterId,
      topicId,
      data,
    }: {
      courseId: string;
      courseSubjectId: string;
      chapterId: string;
      topicId: string;
      data: { name?: string; serialNumber?: number; scheduledUnlockAt?: string | null };
    }) => updateTopic(courseId, courseSubjectId, chapterId, topicId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_COURSE_QUERY_KEYS.chapterWithTopics(variables.courseId, variables.courseSubjectId, variables.chapterId),
      });
      toast.success("Topic updated successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to update topic";
      toast.error(message);
    },
  });
}

export function useUpdateTopicMaterialsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      courseSubjectId,
      chapterId,
      topicId,
      data,
    }: {
      courseId: string;
      courseSubjectId: string;
      chapterId: string;
      topicId: string;
      data: {
        videoLectureId?: string | null;
        liveLectureId?: string | null;
        notesAssetId?: string | null;
        dppBankId?: string | null;
      };
    }) => updateTopicMaterials(courseId, courseSubjectId, chapterId, topicId, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_COURSE_QUERY_KEYS.chapterWithTopics(variables.courseId, variables.courseSubjectId, variables.chapterId),
      });
      toast.success("Topic materials updated successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to update topic materials";
      toast.error(message);
    },
  });
}

export function useSubjectDetailQuery(courseId: string, courseSubjectId: string, enabled = true) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.subjectDetail(courseId, courseSubjectId),
    queryFn: () => getSubjectDetail(courseId, courseSubjectId),
    enabled: !!courseId && !!courseSubjectId && enabled,
    staleTime: 10000,
  });
}

export function useLibraryNotesQuery(subjectId: string, enabled = true) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.libraryNotes(subjectId),
    queryFn: () => getLibraryNotes(subjectId),
    enabled: !!subjectId && enabled,
    staleTime: 30000,
  });
}

export function useLibraryQuestionBanksQuery(subjectId: string, enabled = true) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.libraryQuestionBanks(subjectId),
    queryFn: () => getLibraryQuestionBanks(subjectId),
    enabled: !!subjectId && enabled,
    staleTime: 30000,
  });
}

export function useLibraryVideosQuery(subjectId: string, enabled = true) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.libraryVideos(subjectId),
    queryFn: () => getLibraryVideos(subjectId),
    enabled: !!subjectId && enabled,
    staleTime: 30000,
  });
}

export function useLibraryLiveLecturesQuery(subjectId: string, enabled = true) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.libraryLiveLectures(subjectId),
    queryFn: () => getLibraryLiveLectures(subjectId),
    enabled: !!subjectId && enabled,
    staleTime: 30000,
  });
}

export function useTopicDetailQuery(
  courseId: string,
  courseSubjectId: string,
  chapterId: string,
  topicId: string,
  enabled = true
) {
  return useQuery({
    queryKey: MEMBER_COURSE_QUERY_KEYS.topicDetail(courseId, courseSubjectId, chapterId, topicId),
    queryFn: () => getTopicDetail(courseId, courseSubjectId, chapterId, topicId),
    enabled: !!courseId && !!courseSubjectId && !!chapterId && !!topicId && enabled,
    staleTime: 10000,
  });
}
