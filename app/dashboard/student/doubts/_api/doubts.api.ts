import { apiClient } from "@/lib/api-client";

export interface Subject {
  id: string;
  name: string;
}

export interface UserSummary {
  id: string;
  fullName: string;
  email?: string;
  globalRole?: string;
  profileImage?: string;
}

export interface Doubt {
  id: string;
  studentId: string;
  type: "ACADEMIC" | "NON_ACADEMIC";
  title: string;
  description: string;
  imageUrl?: string | null;
  status: "UNASSIGNED" | "CLAIMED" | "RESOLVED";
  assignedTeacherId?: string | null;
  createdAt: string;
  updatedAt: string;
  subject?: Subject | null;
  student?: UserSummary | null;
  assignedTeacher?: UserSummary | null;
}

export interface DoubtResponse {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  sender: UserSummary;
}

export interface DoubtDetailResponse {
  doubt: Doubt;
  replies: DoubtResponse[];
}

export interface CreateDoubtPayload {
  type: "ACADEMIC" | "NON_ACADEMIC";
  subjectId?: string;
  title: string;
  description: string;
  imageUrl?: string | null;
}

export interface GetStudentDoubtsFilters {
  page: number;
  limit: number;
  status?: "UNASSIGNED" | "CLAIMED" | "RESOLVED";
  subjectId?: string;
}

export interface GetStudentDoubtsResponse {
  data: Doubt[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const doubtsApi = {
  getStudentEligibleSubjects: async (): Promise<Subject[]> => {
    const response = await apiClient.get<{ data: Subject[] }>(
      "/classroom/doubts/subjects"
    );
    return response.data.data;
  },

  createDoubt: async (payload: CreateDoubtPayload): Promise<Doubt> => {
    const response = await apiClient.post<{ data: Doubt }>(
      "/classroom/doubts",
      payload
    );
    return response.data.data;
  },

  getStudentDoubts: async (
    filters: GetStudentDoubtsFilters
  ): Promise<GetStudentDoubtsResponse> => {
    const response = await apiClient.get<GetStudentDoubtsResponse>(
      "/classroom/doubts/student",
      { params: filters }
    );
    return response.data;
  },

  getDoubtDetail: async (doubtId: string): Promise<DoubtDetailResponse> => {
    const response = await apiClient.get<{ data: DoubtDetailResponse }>(
      `/classroom/doubts/${doubtId}`
    );
    return response.data.data;
  },

  addResponse: async (
    doubtId: string,
    payload: { content: string; imageUrl?: string | null }
  ): Promise<DoubtResponse> => {
    const response = await apiClient.post<{ data: DoubtResponse }>(
      `/classroom/doubts/${doubtId}/responses`,
      payload
    );
    return response.data.data;
  },

  resolveDoubt: async (doubtId: string): Promise<Doubt> => {
    const response = await apiClient.patch<{ data: Doubt }>(
      `/classroom/doubts/${doubtId}/resolve`
    );
    return response.data.data;
  },
};
