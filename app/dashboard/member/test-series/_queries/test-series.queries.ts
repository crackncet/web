import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMemberTestSeries,
  getMemberTestSeriesDetail,
  getMemberTestSeriesTests,
  getMemberTeachingStaffList,
  addMemberSubjectsFaculty,
  getMemberTestSubjects,
  addMemberQuestionBank,
  getLibraryQuestionBanks,
  ListTestSeriesQuery,
} from "../_api/test-series.api";
import { toast } from "sonner";

export const MEMBER_TEST_SERIES_QUERY_KEYS = {
  all: ["memberTestSeries"] as const,
  list: (filters: ListTestSeriesQuery) => [...MEMBER_TEST_SERIES_QUERY_KEYS.all, "list", filters] as const,
  detail: (testSeriesId: string) => [...MEMBER_TEST_SERIES_QUERY_KEYS.all, "detail", testSeriesId] as const,
  tests: (testSeriesId: string, page?: number, limit?: number) => [...MEMBER_TEST_SERIES_QUERY_KEYS.all, "tests", testSeriesId, page, limit] as const,
  teachingStaff: (role?: "TEACHER" | "TA") => ["memberTeachingStaff", role] as const,
  testSubjects: (testSeriesId: string, testId: string) => [...MEMBER_TEST_SERIES_QUERY_KEYS.all, "testSubjects", testSeriesId, testId] as const,
};

export function useMemberTestSeriesQuery(filters: ListTestSeriesQuery) {
  return useQuery({
    queryKey: MEMBER_TEST_SERIES_QUERY_KEYS.list(filters),
    queryFn: () => getMemberTestSeries(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}

export function useMemberTestSeriesDetailQuery(testSeriesId: string) {
  return useQuery({
    queryKey: MEMBER_TEST_SERIES_QUERY_KEYS.detail(testSeriesId),
    queryFn: () => getMemberTestSeriesDetail(testSeriesId),
    staleTime: 10000,
  });
}

export function useMemberTestSeriesTestsQuery(testSeriesId: string, query: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: MEMBER_TEST_SERIES_QUERY_KEYS.tests(testSeriesId, query.page, query.limit),
    queryFn: () => getMemberTestSeriesTests(testSeriesId, query),
    staleTime: 10000,
  });
}

export function useMemberTeachingStaffListQuery(role?: "TEACHER" | "TA", enabled = true) {
  return useQuery({
    queryKey: MEMBER_TEST_SERIES_QUERY_KEYS.teachingStaff(role),
    queryFn: () => getMemberTeachingStaffList({ role }),
    enabled: enabled,
    staleTime: 30000,
  });
}

export function useAddMemberSubjectsFacultyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testSeriesId,
      streamId,
      teachingStaffIds,
    }: {
      testSeriesId: string;
      streamId: string;
      teachingStaffIds: string[];
    }) => addMemberSubjectsFaculty(testSeriesId, streamId, teachingStaffIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_TEST_SERIES_QUERY_KEYS.detail(variables.testSeriesId),
      });
      toast.success("Faculty assigned successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to assign faculty";
      toast.error(message);
    },
  });
}

export function useMemberTestSubjectsQuery(testSeriesId: string, testId: string) {
  return useQuery({
    queryKey: MEMBER_TEST_SERIES_QUERY_KEYS.testSubjects(testSeriesId, testId),
    queryFn: () => getMemberTestSubjects(testSeriesId, testId),
    enabled: !!testSeriesId && !!testId,
    staleTime: 5000,
  });
}

export function useLibraryQuestionBanksQuery(subjectId: string, search: string, enabled = true) {
  return useQuery({
    queryKey: ["memberLibraryQuestionBanks", subjectId, search],
    queryFn: () => getLibraryQuestionBanks(subjectId, search),
    enabled: !!subjectId && enabled,
    staleTime: 5000,
  });
}

export function useAddMemberQuestionBankMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testSeriesId,
      testId,
      subjectId,
      questionBankId,
    }: {
      testSeriesId: string;
      testId: string;
      subjectId: string;
      questionBankId: string;
    }) => addMemberQuestionBank(testSeriesId, testId, subjectId, questionBankId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: MEMBER_TEST_SERIES_QUERY_KEYS.testSubjects(variables.testSeriesId, variables.testId),
      });
      toast.success("Question bank attached successfully");
    },
    onError: (error: any) => {
      const message = error instanceof Error ? error.message : "Failed to attach question bank";
      toast.error(message);
    },
  });
}
