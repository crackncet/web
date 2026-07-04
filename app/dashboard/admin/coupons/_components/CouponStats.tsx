"use client";

import React from "react";
import { Tag, Check, Coins } from "lucide-react";

interface CouponStatsProps {
  totalCoupons: number;
  activeCoupons: number;
  totalRedemptions: number;
}

export function CouponStats({
  totalCoupons,
  activeCoupons,
  totalRedemptions,
}: CouponStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
        <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950/30 text-violet-650 dark:text-violet-400">
          <Tag className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Coupons</p>
          <p className="text-2xl font-black text-foreground mt-0.5">{totalCoupons}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-955/20 text-emerald-600 dark:text-emerald-400">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Active Coupons</p>
          <p className="text-2xl font-black text-foreground mt-0.5">{activeCoupons}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex items-center gap-4">
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400">
          <Coins className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Redemptions</p>
          <p className="text-2xl font-black text-foreground mt-0.5">{totalRedemptions}</p>
        </div>
      </div>
    </div>
  );
}
