import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCoupons,
  createCoupon,
  toggleCouponActive,
  CreateCouponInput,
} from "../_api/coupons.api";

export const COUPON_QUERY_KEYS = {
  all: ["adminCoupons"] as const,
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
