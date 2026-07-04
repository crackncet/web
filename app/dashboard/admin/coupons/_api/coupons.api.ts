import { apiClient, ApiSuccessResponse } from "@/lib/api-client";

export interface ApplicableItemInput {
  itemType: "COURSE" | "TEST_SERIES";
  referenceId: string;
}

export interface CreateCouponInput {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  minOrderAmount?: string | null;
  maxDiscountAmount?: string | null;
  totalLimit?: number | null;
  expiresAt?: string | null;
  userId?: string | null;
  applicableItems: ApplicableItemInput[];
}

export interface CouponApplicability {
  itemType: "COURSE" | "TEST_SERIES";
  referenceId: string;
  itemName?: string; // resolved in frontend/backend
}

export interface CouponDetails {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscountAmount: string | null;
  totalLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  userId: string | null;
  userEmail: string | null;
  isActive: boolean;
  createdAt: string;
  applicability: CouponApplicability[];
}

export async function getCoupons(): Promise<CouponDetails[]> {
  const response = await apiClient.get<ApiSuccessResponse<CouponDetails[]>>(
    "/payments/admin/coupons"
  );
  return response.data.data;
}

export async function createCoupon(data: CreateCouponInput) {
  const response = await apiClient.post<ApiSuccessResponse<{ id: string }>>(
    "/payments/admin/coupons",
    data
  );
  return response.data;
}

export async function toggleCouponActive(couponId: string) {
  const response = await apiClient.post<ApiSuccessResponse<{ id: string; isActive: boolean }>>(
    `/payments/admin/coupons/${couponId}/toggle`
  );
  return response.data;
}

export interface UpdateCouponInput {
  minOrderAmount?: string | null;
  maxDiscountAmount?: string | null;
  totalLimit?: number | null;
  expiresAt?: string | null;
  userId?: string | null;
  applicableItems: ApplicableItemInput[];
}

export interface CouponUsageDetails {
  id: string;
  couponId: string;
  couponCode: string;
  studentId: string;
  studentName: string | null;
  studentEmail: string | null;
  orderId: string;
  discountApplied: string;
  usedAt: string;
}

export interface CouponUsagesResponse {
  usages: CouponUsageDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function updateCoupon(couponId: string, data: UpdateCouponInput) {
  const response = await apiClient.put<ApiSuccessResponse<CouponDetails>>(
    `/payments/admin/coupons/${couponId}`,
    data
  );
  return response.data;
}

export async function getCouponUsages(filters: { page: number; limit: number; query?: string }): Promise<CouponUsagesResponse> {
  const params: Record<string, any> = {
    page: filters.page,
    limit: filters.limit,
  };
  if (filters.query?.trim()) {
    params.query = filters.query.trim();
  }
  const response = await apiClient.get<ApiSuccessResponse<CouponUsagesResponse>>(
    "/payments/admin/coupons/usages",
    { params }
  );
  return response.data.data;
}
