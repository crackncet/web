"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import { 
  useAdminCouponsQuery, 
  useCreateCouponMutation, 
  useToggleCouponActiveMutation,
  useUpdateCouponMutation,
  useCouponUsagesQuery
} from "./_queries/coupons.queries";
import { CouponStats } from "./_components/CouponStats";
import { CouponsTable } from "./_components/CouponsTable";
import { RedemptionLogTable } from "./_components/RedemptionLogTable";
import { CouponFormDialog } from "./_components/CouponFormDialog";
import { CouponDetails, ApplicableItemInput } from "./_api/coupons.api";

export default function CouponsAdminPage() {
  const { data: coupons = [], isLoading: isCouponsLoading } = useAdminCouponsQuery();
  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();
  const toggleMutation = useToggleCouponActiveMutation();

  // Tab State
  const [activeTab, setActiveTab] = useState<"coupons" | "usages">("coupons");

  // Usages Log parameters
  const [usagePage, setUsagePage] = useState(1);
  const [usageSearchQuery, setUsageSearchQuery] = useState("");
  
  const { data: usagesData, isLoading: isUsagesLoading } = useCouponUsagesQuery({
    page: usagePage,
    limit: 10,
    query: usageSearchQuery,
  });

  const usagesList = usagesData?.usages || [];
  const usagePagination = usagesData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Dialog UI States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponDetails | null>(null);

  // Stats calculation
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  const handleCreateClick = () => {
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (coupon: CouponDetails) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (formData: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: string;
    minOrderAmount: string | null;
    maxDiscountAmount: string | null;
    totalLimit: number | null;
    expiresAt: string | null;
    userId: string | null;
    applicableItems: ApplicableItemInput[];
  }) => {
    if (editingCoupon) {
      updateMutation.mutate(
        {
          couponId: editingCoupon.id,
          data: {
            minOrderAmount: formData.minOrderAmount,
            maxDiscountAmount: formData.maxDiscountAmount,
            totalLimit: formData.totalLimit,
            expiresAt: formData.expiresAt,
            userId: formData.userId,
            applicableItems: formData.applicableItems,
          },
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          code: formData.code,
          discountType: formData.discountType,
          discountValue: formData.discountValue,
          minOrderAmount: formData.minOrderAmount,
          maxDiscountAmount: formData.maxDiscountAmount,
          totalLimit: formData.totalLimit,
          expiresAt: formData.expiresAt,
          userId: formData.userId,
          applicableItems: formData.applicableItems,
        },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>ADMINISTRATION</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Coupons</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Coupons & Discounts
          </h1>
        </div>
      </AdminHeader>

      {/* Stats Overview */}
      <CouponStats
        totalCoupons={totalCoupons}
        activeCoupons={activeCoupons}
        totalRedemptions={totalRedemptions}
      />

      {/* Tabs Selector */}
      <div className="flex border-b border-border select-none gap-4">
        <button
          onClick={() => setActiveTab("coupons")}
          className={`pb-3 font-bold text-xs uppercase tracking-wider transition-colors border-b-2 px-1 cursor-pointer ${
            activeTab === "coupons"
              ? "border-violet-650 text-violet-650 dark:text-violet-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Coupons List
        </button>
        <button
          onClick={() => setActiveTab("usages")}
          className={`pb-3 font-bold text-xs uppercase tracking-wider transition-colors border-b-2 px-1 cursor-pointer ${
            activeTab === "usages"
              ? "border-violet-650 text-violet-650 dark:text-violet-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Redemption Log
        </button>
      </div>

      {/* Dynamic Tab Views */}
      {activeTab === "coupons" ? (
        <CouponsTable
          coupons={coupons}
          isLoading={isCouponsLoading}
          onToggleActive={(id) => toggleMutation.mutate(id)}
          onEdit={handleEditClick}
          onCreateClick={handleCreateClick}
          isToggling={toggleMutation.isPending}
        />
      ) : (
        <RedemptionLogTable
          usages={usagesList}
          isLoading={isUsagesLoading}
          searchQuery={usageSearchQuery}
          onSearchChange={(query) => {
            setUsageSearchQuery(query);
            setUsagePage(1);
          }}
          pagination={usagePagination}
          onPageChange={setUsagePage}
        />
      )}

      {/* Creation and Edition Dialog Form */}
      <CouponFormDialog
        key={editingCoupon ? `edit-${editingCoupon.id}` : "create"}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingCoupon={editingCoupon}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
