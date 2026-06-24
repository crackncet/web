"use client";

import React, { useState } from "react";
import { Order } from "../_api/finances.api";
import { useRefundOrderMutation } from "../_queries/finances.queries";
import { ShieldAlert, Loader2, RefreshCcw, CheckCircle, Ban, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FinancesTableProps {
  orders: Order[];
  isLoading: boolean;
}

export function FinancesTable({ orders, isLoading }: FinancesTableProps) {
  const { mutate: refundOrder, isPending: isRefunding } = useRefundOrderMutation();
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3 w-3" />
            <span>Paid</span>
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <RefreshCcw className="h-3 w-3 animate-spin-reverse" />
            <span>Refunded</span>
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Ban className="h-3 w-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <AlertCircle className="h-3 w-3" />
            <span>Created</span>
          </span>
        );
    }
  };

  const handleRefundSubmit = () => {
    if (!confirmOrder) return;
    refundOrder(confirmOrder.id, {
      onSettled: () => setConfirmOrder(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-2 text-sm font-medium">
          Loading financial ledger...
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center bg-card">
        <ShieldAlert className="h-10 w-10 text-muted-foreground/60 mb-2" />
        <h3 className="font-medium text-foreground text-base">
          No transactions found
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1 font-normal">
          We couldn't find any orders matching the selected parameters or date ranges.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-semibold uppercase tracking-wider select-none">
            <th className="px-6 py-4">Order / Date</th>
            <th className="px-6 py-4">Student</th>
            <th className="px-6 py-4">Purchased Item(s)</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-foreground/80 text-sm">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-muted/5 transition-colors duration-150">
              {/* Order ID & Date */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-xs font-mono uppercase truncate max-w-[120px]" title={order.id}>
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </td>

              {/* Student details */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-foreground text-sm">
                    {order.student?.fullName || "Deleted Student"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {order.student?.email || "—"}
                  </span>
                </div>
              </td>

              {/* Purchased items */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5 max-w-xs">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex flex-col text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground truncate max-w-[200px]" title={item.itemName}>
                          {item.itemName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-muted border border-border text-[9px] text-muted-foreground font-semibold">
                          {item.itemType}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5">Price: ₹{Number(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">No items recorded</span>
                  )}
                </div>
              </td>

              {/* Amount */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-black text-foreground text-sm">
                  ₹{Number(order.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </td>

              {/* Status Badge */}
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(order.status)}
              </td>

              {/* Actions: Refund */}
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {order.status === "PAID" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmOrder(order)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800/30 dark:text-blue-400 dark:hover:bg-blue-900/10 cursor-pointer font-semibold rounded-lg text-xs"
                  >
                    Refund
                  </Button>
                ) : order.status === "REFUNDED" ? (
                  <span className="text-xs text-muted-foreground italic pr-2 select-none">
                    Refunded
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/60 italic pr-2 select-none">
                    —
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Refund Confirmation Dialog */}
      <Dialog
        open={!!confirmOrder}
        onOpenChange={(open) => {
          if (!open) setConfirmOrder(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <RefreshCcw className="h-5 w-5" />
              <span>Confirm Razorpay Refund</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-2">
              You are about to issue a full refund of <span className="font-black text-foreground">₹{confirmOrder ? Number(confirmOrder.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : ""}</span> for the transaction made by <span className="font-semibold text-foreground">{confirmOrder?.student?.fullName}</span> ({confirmOrder?.student?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/40 border border-border rounded-lg p-4 space-y-2.5 text-xs text-foreground/80">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-mono">{confirmOrder?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Razorpay Payment ID:</span>
              <span className="font-mono">{confirmOrder?.providerPaymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items Purchased:</span>
              <span className="font-medium text-right max-w-[200px] truncate">
                {confirmOrder?.items?.map(i => i.itemName).join(", ")}
              </span>
            </div>
            <div className="border-t border-border pt-2 text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-start gap-1.5 leading-snug">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Warning: This refund cannot be undone. All active course/test series enrollments linked to this order will be automatically revoked.
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOrder(null)}
              disabled={isRefunding}
              className="cursor-pointer rounded-lg text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefundSubmit}
              disabled={isRefunding}
              className="cursor-pointer rounded-lg text-xs"
            >
              {isRefunding ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                "Confirm & Refund"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
