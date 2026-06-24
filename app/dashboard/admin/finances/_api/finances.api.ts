import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface OrderItem {
  id: string;
  orderId: string;
  itemType: string;
  referenceId: string;
  itemName: string;
  price: string;
}

export interface Student {
  id: string;
  fullName: string;
  email: string;
}

export interface Order {
  id: string;
  amount: string;
  currency: string;
  status: "CREATED" | "PAID" | "FAILED" | "REFUNDED";
  provider: string;
  receipt: string | null;
  providerOrderId: string;
  providerPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
  student: Student;
  items: OrderItem[];
}

export interface AnalyticsDetail {
  totalAmount: number;
  count: number;
}

export interface FinanceAnalytics {
  totalRevenue: number;
  totalOrders: number;
  [key: string]: AnalyticsDetail | number;
}

export interface GetAdminOrdersFilters {
  page: number;
  limit: number;
  query?: string;
  status?: string;
  itemType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "createdAt" | "amount";
  sortOrder?: "asc" | "desc";
}

export interface GetAdminOrdersResponse {
  orders: Order[];
  analytics: FinanceAnalytics;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
  itemTypes: string[];
}

export async function getAdminOrders(filters: GetAdminOrdersFilters): Promise<GetAdminOrdersResponse> {
  const params: Record<string, any> = {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy || "createdAt",
    sortOrder: filters.sortOrder || "desc",
  };

  if (filters.query?.trim()) {
    params.query = filters.query.trim();
  }
  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.itemType) {
    params.itemType = filters.itemType;
  }
  if (filters.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters.endDate) {
    params.endDate = filters.endDate;
  }

  const response = await apiClient.get<ApiSuccessResponse<{ orders: Order[]; analytics: FinanceAnalytics }>>(
    "/payments/admin/orders",
    { params }
  );

  return {
    orders: response.data.data.orders,
    analytics: response.data.data.analytics,
    pagination: {
      page: response.data.meta?.pagination?.page ?? filters.page ?? 1,
      limit: response.data.meta?.pagination?.limit ?? filters.limit ?? 20,
      totalPages: response.data.meta?.pagination?.totalPages ?? 1,
      total: response.data.meta?.pagination?.total ?? 0,
    },
    itemTypes: response.data.meta?.itemTypes ?? ["COURSE", "TEST_SERIES"],
  };
}

export async function refundOrder(orderId: string) {
  const response = await apiClient.post<ApiSuccessResponse<any>>(
    `/payments/admin/orders/${orderId}/refund`
  );
  return response.data;
}
