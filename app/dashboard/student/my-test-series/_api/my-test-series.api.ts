import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface EnrolledTestSeries {
  enrollmentId: string;
  testSeriesId: string;
  name: string;
  description: string | null;
  banner: string | null;
  examName: string;
  enrolledAt: string;
}

export interface StudentTest {
  testId: string;
  name: string;
  description: string | null;
  scheduledAt: string;
  durationMinutes: number;
  attemptStatus: "STARTED" | "SUBMITTED" | "EVALUATED" | null;
}

export interface TestSeriesDetail {
  testSeries: {
    id: string;
    name: string;
    description: string | null;
    banner: string | null;
  };
  tests: StudentTest[];
}

export async function getMyTestSeries() {
  const response = await apiClient.get<ApiSuccessResponse<EnrolledTestSeries[]>>(
    "/classroom/test-series"
  );
  return response.data;
}

export async function getTestSeriesDetails(testSeriesId: string) {
  const response = await apiClient.get<ApiSuccessResponse<TestSeriesDetail>>(
    `/classroom/test-series/${testSeriesId}`
  );
  return response.data;
}
