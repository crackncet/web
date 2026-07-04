"use client";

import React, { useState } from "react";
import { CouponDetails } from "../_api/coupons.api";
import {
  Search,
  Plus,
  Loader2,
  Tag,
  Percent,
  Coins,
  BookOpen,
  GraduationCap,
  Calendar,
  User,
  Pencil
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CouponsTableProps {
  coupons: CouponDetails[];
  isLoading: boolean;
  onToggleActive: (couponId: string) => void;
  onEdit: (coupon: CouponDetails) => void;
  onCreateClick: () => void;
  isToggling: boolean;
}

export function CouponsTable({
  coupons,
  isLoading,
  onToggleActive,
  onEdit,
  onCreateClick,
  isToggling,
}: CouponsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
      {/* Filters, search, add button bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-border bg-muted/10">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupon code..."
            className="pl-9 pr-4 py-2 w-full text-xs font-bold rounded-lg border border-border bg-background focus:outline-none focus:border-violet-500 uppercase tracking-wider text-foreground placeholder:normal-case placeholder:font-normal"
          />
        </div>

        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 px-4 h-9 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer select-none"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </button>
      </div>

      {/* Coupons List Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Tag className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs font-extrabold text-foreground uppercase tracking-wider">No Coupons Found</p>
            <p className="text-xs text-muted-foreground max-w-xs">Create your first discount coupon to offer pricing options to your students.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-[10px] font-black uppercase tracking-wider text-muted-foreground/80 font-sans">
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Applicability</th>
                <th className="p-4">Usage Limit</th>
                <th className="p-4">Expiration</th>
                <th className="p-4">Target User</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-semibold text-foreground">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-muted/5 transition-colors">
                  <td className="p-4">
                    <span className="inline-block px-2.5 py-1 text-xs font-extrabold tracking-wider uppercase bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 rounded-md border border-violet-100 dark:border-violet-900/30">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      {coupon.discountType === "PERCENTAGE" ? (
                        <>
                          <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{coupon.discountValue}% Off</span>
                        </>
                      ) : (
                        <>
                          <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>₹{parseFloat(coupon.discountValue).toLocaleString("en-IN")} Off</span>
                        </>
                      )}
                    </div>
                    {(coupon.minOrderAmount || coupon.maxDiscountAmount) && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {coupon.minOrderAmount && `Min order: ₹${parseFloat(coupon.minOrderAmount).toLocaleString("en-IN")}`}
                        {coupon.minOrderAmount && coupon.maxDiscountAmount && " • "}
                        {coupon.maxDiscountAmount && `Max Cap: ₹${parseFloat(coupon.maxDiscountAmount).toLocaleString("en-IN")}`}
                      </p>
                    )}
                  </td>
                  <td className="p-4 max-w-[220px]">
                    <div className="flex flex-wrap gap-1">
                      {coupon.applicability.map((app, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {app.itemType === "COURSE" ? (
                            <BookOpen className="h-3 w-3 text-violet-500" />
                          ) : (
                            <GraduationCap className="h-3 w-3 text-emerald-500" />
                          )}
                          <span className="truncate max-w-[120px]" title={app.itemName}>
                            {app.itemName || "Applicable Item"}
                          </span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className="font-extrabold text-foreground">
                        {coupon.usedCount} used
                      </span>
                      {coupon.totalLimit ? (
                        <span className="text-muted-foreground block text-[10px]">
                          out of {coupon.totalLimit} max
                        </span>
                      ) : (
                        <span className="text-muted-foreground block text-[10px]">
                          • Unlimited
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {coupon.expiresAt ? (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(coupon.expiresAt).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never Expires</span>
                    )}
                  </td>
                  <td className="p-4">
                    {coupon.userId ? (
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                        <User className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[120px]" title={coupon.userEmail || ""}>
                          {coupon.userEmail || "Specific User"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Global</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onToggleActive(coupon.id)}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer select-none transition-all ${
                              coupon.isActive
                                ? "bg-emerald-50 dark:bg-emerald-955/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                                : "bg-rose-50 dark:bg-rose-955/20 border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100"
                            }`}
                          >
                            {coupon.isActive ? "Active" : "Inactive"}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Toggle status</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onEdit(coupon)}
                      className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer select-none"
                      title="Edit Coupon"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
