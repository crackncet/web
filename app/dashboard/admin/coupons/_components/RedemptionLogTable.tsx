"use client";

import React from "react";
import { CouponUsageDetails } from "../_api/coupons.api";
import { Search, Loader2, FileText } from "lucide-react";

interface RedemptionLogTableProps {
  usages: CouponUsageDetails[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export function RedemptionLogTable({
  usages,
  isLoading,
  searchQuery,
  onSearchChange,
  pagination,
  onPageChange,
}: RedemptionLogTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
      {/* Search bar */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-muted/10">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by student email, name or coupon code..."
            className="pl-9 pr-4 py-2 w-full text-xs font-bold rounded-lg border border-border bg-background focus:outline-none focus:border-violet-500 text-foreground"
          />
        </div>
      </div>

      {/* Usage Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Loading logs...</p>
          </div>
        ) : usages.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <FileText className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs font-extrabold text-foreground uppercase tracking-wider">No Redemptions Logged</p>
            <p className="text-xs text-muted-foreground max-w-xs">When users apply discount coupons during course checkout, logs will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 font-sans">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Student Name & Email</th>
                <th className="p-4 text-right">Discount Applied</th>
                <th className="p-4">Order Reference</th>
                <th className="p-4 text-right">Redeemed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
              {usages.map((usage) => (
                <tr key={usage.id} className="hover:bg-muted/5 transition-colors">
                  <td className="p-4">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 rounded border border-violet-100 dark:border-violet-900/30">
                      {usage.couponCode}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold">{usage.studentName || "N/A"}</span>
                      <span className="text-[10px] text-muted-foreground">{usage.studentEmail}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-extrabold text-violet-750 dark:text-violet-400">
                    ₹{parseFloat(usage.discountApplied).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-[10px] bg-muted px-2 py-1 rounded border border-border select-all">
                      {usage.orderId}
                    </span>
                  </td>
                  <td className="p-4 text-right text-muted-foreground text-[11px]">
                    {new Date(usage.usedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase select-none">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} logs)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className="px-3 h-8 border border-border text-xs font-bold rounded-lg hover:bg-muted disabled:opacity-50 transition-colors select-none cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 h-8 border border-border text-xs font-bold rounded-lg hover:bg-muted disabled:opacity-50 transition-colors select-none cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
