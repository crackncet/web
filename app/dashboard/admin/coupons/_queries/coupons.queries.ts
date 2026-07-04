import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCoupons,
  createCoupon,
  toggleCouponActive,
  updateCoupon,
  getCouponUsages,
  CreateCouponInput,
  UpdateCouponInput,
} from "../_api/coupons.api";

export const COUPON_QUERY_KEYS = {
  all: ["adminCoupons"] as const,
  usages: (filters: { page: number; limit: number; query?: string }) => [...COUPON_QUERY_KEYS.all, "usages", filters] as const,
};

export function useAdminCouponsQuery() {
  return useQuery({
    queryKey: COUPON_QUERY_KEYS.all,
    queryFn: getCoupons,
    staleTime: 5000,
  });
}

export function useCreateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponInput) => createCoupon(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all });
      toast.success(res.message || "Coupon created successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to create coupon";
      toast.error(message);
    },
  });
}

export function useUpdateCouponMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ couponId, data }: { couponId: string; data: UpdateCouponInput }) =>
      updateCoupon(couponId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all });
      toast.success(res.message || "Coupon updated successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to update coupon";
      toast.error(message);
    },
  });
}

export function useToggleCouponActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => toggleCouponActive(couponId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: COUPON_QUERY_KEYS.all });
      toast.success(res.message || "Coupon status toggled successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to toggle coupon status";
      toast.error(message);
    },
  });
}

export function useCouponUsagesQuery(filters: { page: number; limit: number; query?: string }) {
  return useQuery({
    queryKey: COUPON_QUERY_KEYS.usages(filters),
    queryFn: () => getCouponUsages(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
}
