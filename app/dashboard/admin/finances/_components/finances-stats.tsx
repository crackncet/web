"use client";

import React from "react";
import { DollarSign, ShoppingBag, BookOpen, GraduationCap, BarChart2 } from "lucide-react";
import { FinanceAnalytics } from "../_api/finances.api";

interface FinancesStatsProps {
  analytics?: FinanceAnalytics;
}

export function FinancesStats({ analytics }: FinancesStatsProps) {
  if (!analytics) return null;

  const totalRevenue = Number(analytics.totalRevenue || 0);
  const totalOrders = Number(analytics.totalOrders || 0);

  // Filter out non-item-type fields to display dynamic product types
  const productTypes = Object.keys(analytics).filter(
    (key) => key !== "totalRevenue" && key !== "totalOrders"
  );

  const getProductIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "COURSE":
        return <BookOpen className="h-5 w-5 text-indigo-500" />;
      case "TEST_SERIES":
        return <GraduationCap className="h-5 w-5 text-emerald-500" />;
      default:
        return <BarChart2 className="h-5 w-5 text-sky-500" />;
    }
  };

  const getProductColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "COURSE":
        return "border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400";
      case "TEST_SERIES":
        return "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400";
      default:
        return "border-sky-500/20 bg-sky-500/5 text-sky-700 dark:text-sky-400";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue Card */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </span>
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              ₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <span>Successful transactions in selected range</span>
        </div>
      </div>

      {/* Total Orders Card */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Purchases Count
            </span>
            <h3 className="text-2xl font-black tracking-tight text-foreground">
              {totalOrders}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <span>Total items sold in selected range</span>
        </div>
      </div>

      {/* Dynamic Breakdown Cards */}
      {productTypes.map((type) => {
        const data = analytics[type] as { totalAmount: number; count: number };
        const amount = Number(data?.totalAmount || 0);
        const count = Number(data?.count || 0);
        const formattedType = type.replace("_", " ");

        return (
          <div
            key={type}
            className={`relative overflow-hidden rounded-xl border p-5 shadow-xs transition-all duration-200 hover:shadow-md bg-card border-border`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {formattedType} SALES
                </span>
                <h3 className="text-2xl font-black tracking-tight text-foreground">
                  ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-muted/40`}>
                {getProductIcon(type)}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{count} unit{count !== 1 ? "s" : ""} sold</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getProductColor(type)}`}>
                {totalRevenue > 0
                  ? `${Math.round((amount / totalRevenue) * 100)}% share`
                  : "0% share"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
