import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAdminOrders, refundOrder, GetAdminOrdersFilters } from "../_api/finances.api";

export const financeQueryKeys = {
  all: ["finances"] as const,
  orders: (filters: GetAdminOrdersFilters) => [...financeQueryKeys.all, "orders", filters] as const,
};

export function useAdminOrdersQuery(filters: GetAdminOrdersFilters) {
  return useQuery({
    queryKey: financeQueryKeys.orders(filters),
    queryFn: () => getAdminOrders(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useRefundOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => refundOrder(orderId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.all });
      toast.success(data.message || "Order refunded successfully");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error.message || "Failed to process refund";
      toast.error(message);
    },
  });
}
