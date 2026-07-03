import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface OrderItem {
  id: string;
  itemName: string;
  itemType: "COURSE" | "TEST_SERIES";
  price: string;
}

export interface StudentTransaction {
  id: string;
  amount: string;
  currency: string;
  status: "CREATED" | "PAID" | "FAILED" | "REFUNDED";
  providerPaymentId: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface StudentEnrollment {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED" | "SUSPENDED";
  expiresAt: string | null;
  createdAt: string;
  courseId: string | null;
  courseTitle: string | null;
  testSeriesId: string | null;
  testSeriesName: string | null;
  subjects: Array<{
    id: string;
    name: string;
  }>;
}

export interface StudentBillingData {
  enrollments: StudentEnrollment[];
  transactions: StudentTransaction[];
}

export async function getStudentTransactions() {
  const response = await apiClient.get<ApiSuccessResponse<StudentBillingData>>(
    "/enrollments/my-transactions"
  );
  return response.data;
}
