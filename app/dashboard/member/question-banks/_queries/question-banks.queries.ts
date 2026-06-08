import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getQuestionBanks,
  createQuestionBank,
  getQuestionBankDetail,
  updateQuestionBank,
  createQuestionBankSection,
  updateQuestionBankSection,
  getSectionQuestions,
  previewQuestions,
  getPreviewStatus,
  uploadQuestions,
  translateQuestions,
  updateQuestion,
  ListQuestionBanksQuery,
  CreateQuestionBankInput,
  UpdateQuestionBankInput,
  CreateSectionInput,
  UpdateSectionInput,
  UploadQuestionsInput,
} from "../_api/question-banks.api";

export const QUESTION_BANKS_KEYS = {
  all: ["question-banks"] as const,
  lists: () => [...QUESTION_BANKS_KEYS.all, "list"] as const,
  list: (query: ListQuestionBanksQuery) => [...QUESTION_BANKS_KEYS.lists(), query] as const,
  details: () => [...QUESTION_BANKS_KEYS.all, "detail"] as const,
  detail: (id: string, page: number, limit: number) =>
    [...QUESTION_BANKS_KEYS.details(), id, { page, limit }] as const,
  sectionQuestions: (bankId: string, sectionId: string, page: number, limit: number) =>
    [...QUESTION_BANKS_KEYS.all, "section-questions", bankId, sectionId, { page, limit }] as const,
  preview: (bankId: string, jobId: string) =>
    [...QUESTION_BANKS_KEYS.all, "preview", bankId, jobId] as const,
};

export function useQuestionBanks(query: ListQuestionBanksQuery) {
  return useQuery({
    queryKey: QUESTION_BANKS_KEYS.list(query),
    queryFn: () => getQuestionBanks(query),
  });
}

export function useCreateQuestionBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuestionBankInput) => createQuestionBank(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_KEYS.lists() });
    },
  });
}

export function useQuestionBankDetail(bankId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: QUESTION_BANKS_KEYS.detail(bankId, page, limit),
    queryFn: () => getQuestionBankDetail(bankId, page, limit),
    enabled: !!bankId,
  });
}

export function useUpdateQuestionBank(bankId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateQuestionBankInput) => updateQuestionBank(bankId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_KEYS.detail(bankId, 1, 20) });
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_KEYS.lists() });
    },
  });
}

export function useCreateQuestionBankSection(bankId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSectionInput) => createQuestionBankSection(bankId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_KEYS.detail(bankId, 1, 20) });
    },
  });
}

export function useUpdateQuestionBankSection(bankId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sectionId, body }: { sectionId: string; body: UpdateSectionInput }) =>
      updateQuestionBankSection(bankId, sectionId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_KEYS.detail(bankId, 1, 20) });
    },
  });
}

export function useSectionQuestions(bankId: string, sectionId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: QUESTION_BANKS_KEYS.sectionQuestions(bankId, sectionId, page, limit),
    queryFn: () => getSectionQuestions(bankId, sectionId, page, limit),
    enabled: !!bankId && !!sectionId,
  });
}

export function usePreviewQuestions(bankId: string) {
  return useMutation({
    mutationFn: (file: File) => previewQuestions(bankId, file),
  });
}

export function usePreviewStatus(bankId: string, jobId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUESTION_BANKS_KEYS.preview(bankId, jobId),
    queryFn: () => getPreviewStatus(bankId, jobId),
    enabled: enabled && !!bankId && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === "completed" || status === "failed") {
        return false;
      }
      return 3000; // poll every 3 seconds
    },
  });
}

export function useUploadQuestions(bankId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UploadQuestionsInput) => uploadQuestions(bankId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_KEYS.detail(bankId, 1, 20) });
    },
  });
}

export function useUpdateQuestion(bankId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, body }: { questionId: string; body: any }) =>
      updateQuestion(bankId, questionId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_KEYS.all });
    },
  });
}

export function useTranslateQuestions(bankId: string) {
  return useMutation({
    mutationFn: (texts: string[]) => translateQuestions(bankId, texts),
  });
}
