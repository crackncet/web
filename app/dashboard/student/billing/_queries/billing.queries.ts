import { useQuery } from "@tanstack/react-query";
import { getStudentTransactions } from "../_api/billing.api";

export const STUDENT_BILLING_QUERY_KEYS = {
  all: ["studentBilling"] as const,
  transactions: () => [...STUDENT_BILLING_QUERY_KEYS.all, "transactions"] as const,
};

export function useStudentTransactionsQuery() {
  return useQuery({
    queryKey: STUDENT_BILLING_QUERY_KEYS.transactions(),
    queryFn: getStudentTransactions,
    staleTime: 2 * 60 * 1000,
  });
}
