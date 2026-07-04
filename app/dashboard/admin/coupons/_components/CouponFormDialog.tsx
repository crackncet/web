"use client";

import React, { useState } from "react";
import { CouponDetails, ApplicableItemInput } from "../_api/coupons.api";
import { useAdminCoursesQuery } from "../../courses/_queries/courses.queries";
import { useAdminTestSeriesQuery } from "../../test-series/_queries/test-series.queries";
import { useUsersQuery } from "../../users/_queries/users.queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  Loader2,
  User,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";

interface CouponFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCoupon: CouponDetails | null;
  onSubmit: (data: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: string;
    minOrderAmount: string | null;
    maxDiscountAmount: string | null;
    totalLimit: number | null;
    expiresAt: string | null;
    userId: string | null;
    applicableItems: ApplicableItemInput[];
  }) => void;
  isPending: boolean;
}

export function CouponFormDialog({
  isOpen,
  onOpenChange,
  editingCoupon,
  onSubmit,
  isPending,
}: CouponFormDialogProps) {
  // Form states initialized directly from editingCoupon
  const [code, setCode] = useState(editingCoupon?.code || "");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(editingCoupon?.discountType || "PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(editingCoupon?.discountValue || "");
  const [minOrderAmount, setMinOrderAmount] = useState(editingCoupon?.minOrderAmount || "");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(editingCoupon?.maxDiscountAmount || "");
  const [totalLimit, setTotalLimit] = useState(editingCoupon?.totalLimit ? String(editingCoupon.totalLimit) : "");
  const [expiresAt, setExpiresAt] = useState(editingCoupon?.expiresAt ? editingCoupon.expiresAt.substring(0, 10) : "");
  const [targetUserId, setTargetUserId] = useState(editingCoupon?.userId || "");

  // Selected items with names to render as badges even when they're filtered out
  const [selectedItems, setSelectedItems] = useState<{
    itemType: "COURSE" | "TEST_SERIES";
    referenceId: string;
    itemName: string;
  }[]>(
    editingCoupon
      ? editingCoupon.applicability.map((app) => ({
          itemType: app.itemType,
          referenceId: app.referenceId,
          itemName: app.itemName || "Applicable Program",
        }))
      : []
  );

  // Search input texts for dynamic query loads
  const [userSearchText, setUserSearchText] = useState(editingCoupon?.userEmail ? `${editingCoupon.userEmail}` : "");
  const [courseSearchText, setCourseSearchText] = useState("");
  const [testSeriesSearchText, setTestSeriesSearchText] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Queries using the search state (only active when dialog is open)
  const { data: coursesData } = useAdminCoursesQuery({ 
    page: 1, 
    limit: 20, 
    query: courseSearchText 
  });
  const { data: testSeriesData } = useAdminTestSeriesQuery({ 
    page: 1, 
    limit: 20, 
    query: testSeriesSearchText 
  });
  const { data: usersData } = useUsersQuery({ 
    page: 1, 
    limit: 20, 
    query: userSearchText,
    globalRole: "STUDENT" 
  });

  const searchedCourses = coursesData?.data || [];
  const searchedTestSeries = testSeriesData?.data || [];
  const searchedStudents = usersData?.users || [];

  const handleToggleItem = (itemType: "COURSE" | "TEST_SERIES", id: string, name: string) => {
    const exists = selectedItems.some(
      (item) => item.itemType === itemType && item.referenceId === id
    );

    if (exists) {
      setSelectedItems(
        selectedItems.filter(
          (item) => !(item.itemType === itemType && item.referenceId === id)
        )
      );
    } else {
      setSelectedItems([...selectedItems, { itemType, referenceId: id, itemName: name }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCoupon && !code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!editingCoupon && (!discountValue || isNaN(parseFloat(discountValue)) || parseFloat(discountValue) <= 0)) {
      toast.error("Please enter a valid positive discount value");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one applicable course or test series");
      return;
    }

    onSubmit({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: discountValue.trim(),
      minOrderAmount: minOrderAmount ? minOrderAmount.trim() : null,
      maxDiscountAmount: maxDiscountAmount ? maxDiscountAmount.trim() : null,
      totalLimit: totalLimit ? parseInt(totalLimit) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      userId: targetUserId || null,
      applicableItems: selectedItems.map((item) => ({
        itemType: item.itemType,
        referenceId: item.referenceId,
      })),
    });
  };

  const isEditMode = !!editingCoupon;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg bg-background border border-border rounded-2xl select-none p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-black uppercase tracking-wider text-foreground">
            {isEditMode ? `Edit Coupon (${editingCoupon.code})` : "Create Discount Coupon"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditMode
              ? "Update coupon rules and applicability. Code and discount amount cannot be changed."
              : "Configure code, rates, expirations, applicability rules, and targeted student restrictions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Coupon Code */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {isEditMode ? "Coupon Code (Read-Only)" : "Coupon Code *"}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isEditMode}
              placeholder="E.G. FESTIVE50"
              className={`w-full px-3 h-10 text-xs font-bold uppercase tracking-wider border border-border rounded-xl focus:outline-none focus:border-violet-500 text-foreground ${
                isEditMode ? "bg-muted/40 text-muted-foreground cursor-not-allowed select-none" : "bg-muted/10"
              }`}
              required={!isEditMode}
            />
          </div>

          {/* Discount Type & Value Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
                disabled={isEditMode}
                className={`w-full px-3 h-10 text-xs font-bold border border-border rounded-xl bg-background focus:outline-none focus:border-violet-500 text-foreground ${
                  isEditMode ? "bg-muted/40 text-muted-foreground cursor-not-allowed select-none" : ""
                }`}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Discount Value *
              </label>
              <input
                type="text"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                disabled={isEditMode}
                placeholder={discountType === "PERCENTAGE" ? "E.G. 10" : "E.G. 500"}
                className={`w-full px-3 h-10 text-xs font-bold border border-border rounded-xl focus:outline-none focus:border-violet-500 text-foreground ${
                  isEditMode ? "bg-muted/40 text-muted-foreground cursor-not-allowed select-none" : "bg-muted/10"
                }`}
                required={!isEditMode}
              />
            </div>
          </div>

          {/* Optional limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Min Order Amount (₹)
              </label>
              <input
                type="text"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 h-10 text-xs font-bold border border-border rounded-xl bg-muted/10 focus:outline-none focus:border-violet-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Max Discount (₹)
              </label>
              <input
                type="text"
                value={maxDiscountAmount}
                disabled={discountType === "FIXED"}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                placeholder={discountType === "FIXED" ? "N/A (Fixed)" : "Optional"}
                className="w-full px-3 h-10 text-xs font-bold border border-border rounded-xl bg-muted/10 focus:outline-none focus:border-violet-500 text-foreground disabled:opacity-50"
              />
            </div>
          </div>

          {/* Total Limit & Expiration Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Total Usage Limit
              </label>
              <input
                type="number"
                value={totalLimit}
                onChange={(e) => setTotalLimit(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full px-3 h-10 text-xs font-bold border border-border rounded-xl bg-muted/10 focus:outline-none focus:border-violet-500 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Expiration Date
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 h-10 text-xs font-bold border border-border rounded-xl bg-muted/10 focus:outline-none focus:border-violet-500 text-foreground"
              />
            </div>
          </div>

          {/* Targeted User / Student Search */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Targeted Student (User Specific)</span>
              <span className="text-[9px] font-bold text-amber-600 uppercase">Optional</span>
            </label>

            {targetUserId ? (
              <div className="flex items-center justify-between p-3 border border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-955/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-650" />
                  <span className="text-xs font-bold text-foreground truncate max-w-[280px]">
                    {userSearchText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTargetUserId("");
                    setUserSearchText("");
                  }}
                  className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={userSearchText}
                    onChange={(e) => {
                      setUserSearchText(e.target.value);
                      setShowUserDropdown(true);
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                    placeholder="Search student by email id..."
                    className="pl-9 pr-4 w-full h-10 text-xs font-bold border border-border rounded-xl bg-muted/10 focus:outline-none focus:border-violet-500 text-foreground"
                  />
                </div>

                {showUserDropdown && userSearchText.trim() && (
                  <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto border border-border bg-background rounded-xl shadow-lg divide-y divide-border">
                    {searchedStudents.length === 0 ? (
                      <div className="p-3 text-xs text-muted-foreground text-center">
                        No students found matching this email.
                      </div>
                    ) : (
                      searchedStudents.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setTargetUserId(st.id);
                            setUserSearchText(`${st.fullName} (${st.email})`);
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left p-2.5 hover:bg-muted/50 transition-colors flex flex-col cursor-pointer"
                        >
                          <span className="text-xs font-bold text-foreground">{st.fullName}</span>
                          <span className="text-[10px] text-muted-foreground">{st.email}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Selected Items Badges */}
          {selectedItems.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Selected Items ({selectedItems.length})
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded-xl bg-muted/5 max-h-[100px] overflow-y-auto">
                {selectedItems.map((item) => (
                  <span
                    key={`${item.itemType}-${item.referenceId}`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-750 dark:text-violet-300 border border-violet-100 dark:border-violet-900/30"
                  >
                    {item.itemType === "COURSE" ? (
                      <BookOpen className="h-3 w-3 text-violet-500" />
                    ) : (
                      <GraduationCap className="h-3 w-3 text-emerald-500" />
                    )}
                    <span className="truncate max-w-[150px]">{item.itemName}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.itemType, item.referenceId, "")}
                      className="p-0.5 hover:bg-violet-105 dark:hover:bg-violet-900/40 rounded-full text-violet-655 cursor-pointer animate-none"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Applicability picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Applicable Programs (Search & Select Courses / Test Series) *
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Search Course */}
              <div className="space-y-1 relative">
                <span className="text-[9px] font-black uppercase text-violet-655 tracking-wider">Courses</span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={courseSearchText}
                    onChange={(e) => setCourseSearchText(e.target.value)}
                    placeholder="Search course title..."
                    className="pl-8 pr-2 w-full h-8 text-[11px] font-bold border border-border rounded-lg bg-muted/10 focus:outline-none focus:border-violet-500 text-foreground"
                  />
                </div>
                <div className="mt-1.5 border border-border rounded-lg max-h-32 overflow-y-auto p-1.5 bg-muted/5 space-y-1">
                  {searchedCourses.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground block text-center py-2">No courses found</span>
                  ) : (
                    searchedCourses.map((c) => {
                      const isChecked = selectedItems.some(
                        (item) => item.itemType === "COURSE" && item.referenceId === c.id
                      );
                      return (
                        <label
                          key={c.id}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-foreground cursor-pointer select-none p-1 hover:bg-muted/30 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItem("COURSE", c.id, c.title)}
                            className="h-3 w-3 rounded text-violet-605 border-border focus:ring-violet-500"
                          />
                          <span className="truncate" title={c.title}>{c.title}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Search Test Series */}
              <div className="space-y-1 relative">
                <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Test Series</span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={testSeriesSearchText}
                    onChange={(e) => setTestSeriesSearchText(e.target.value)}
                    placeholder="Search test series..."
                    className="pl-8 pr-2 w-full h-8 text-[11px] font-bold border border-border rounded-lg bg-muted/10 focus:outline-none focus:border-violet-500 text-foreground"
                  />
                </div>
                <div className="mt-1.5 border border-border rounded-lg max-h-32 overflow-y-auto p-1.5 bg-muted/5 space-y-1">
                  {searchedTestSeries.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground block text-center py-2">No test series found</span>
                  ) : (
                    searchedTestSeries.map((ts) => {
                      const isChecked = selectedItems.some(
                        (item) => item.itemType === "TEST_SERIES" && item.referenceId === ts.id
                      );
                      return (
                        <label
                          key={ts.id}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-foreground cursor-pointer select-none p-1 hover:bg-muted/30 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleItem("TEST_SERIES", ts.id, ts.name)}
                            className="h-3 w-3 rounded text-violet-600 border-border focus:ring-violet-500"
                          />
                          <span className="truncate" title={ts.name}>{ts.name}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 h-10 border border-border hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer select-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center gap-1.5 px-6 h-10 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer select-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <span>{isEditMode ? "Update Coupon" : "Create Coupon"}</span>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
