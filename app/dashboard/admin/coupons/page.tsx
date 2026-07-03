"use client";

import React, { useState } from "react";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import { 
  useAdminCouponsQuery, 
  useCreateCouponMutation, 
  useToggleCouponActiveMutation 
} from "./_queries/coupons.queries";
import { useAdminCoursesQuery } from "../courses/_queries/courses.queries";
import { useAdminTestSeriesQuery } from "../test-series/_queries/test-series.queries";
import { useUsersQuery } from "../users/_queries/users.queries";
import { Course } from "../courses/_api/courses.api";
import { TestSeries } from "../test-series/_api/test-series.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Tag, 
  Check, 
  X, 
  Percent, 
  Coins, 
  Calendar, 
  User, 
  BookOpen, 
  GraduationCap, 
  Loader2 
} from "lucide-react";
import { toast } from "sonner";

export default function CouponsAdminPage() {
  const { data: coupons = [], isLoading: isCouponsLoading } = useAdminCouponsQuery();
  const createMutation = useCreateCouponMutation();
  const toggleMutation = useToggleCouponActiveMutation();

  // Load applicability options
  const { data: coursesData } = useAdminCoursesQuery({ page: 1, limit: 100 });
  const { data: testSeriesData } = useAdminTestSeriesQuery({ page: 1, limit: 100 });
  const { data: usersData } = useUsersQuery({ page: 1, limit: 100 });

  const courseList = coursesData?.data || [];
  const testSeriesList = testSeriesData?.data || [];
  const studentList = usersData?.users?.filter(u => u.globalRole === "STUDENT") || [];

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [totalLimit, setTotalLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [selectedItems, setSelectedItems] = useState<{
    itemType: "COURSE" | "TEST_SERIES";
    referenceId: string;
  }[]>([]);

  // Filter coupons locally
  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  const handleToggleItem = (itemType: "COURSE" | "TEST_SERIES", id: string) => {
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
      setSelectedItems([...selectedItems, { itemType, referenceId: id }]);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!discountValue || isNaN(parseFloat(discountValue)) || parseFloat(discountValue) <= 0) {
      toast.error("Please enter a valid positive discount value");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one applicable course or test series");
      return;
    }

    createMutation.mutate(
      {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: discountValue.trim(),
        minOrderAmount: minOrderAmount ? minOrderAmount.trim() : null,
        maxDiscountAmount: maxDiscountAmount ? maxDiscountAmount.trim() : null,
        totalLimit: totalLimit ? parseInt(totalLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        userId: targetUserId || null,
        applicableItems: selectedItems,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          // Reset form
          setCode("");
          setDiscountType("PERCENTAGE");
          setDiscountValue("");
          setMinOrderAmount("");
          setMaxDiscountAmount("");
          setTotalLimit("");
          setExpiresAt("");
          setTargetUserId("");
          setSelectedItems([]);
        },
      }
    );
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

      {/* Stats Cards Row */}
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

      {/* Main Unified Card Container */}
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
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 h-9 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer select-none"
          >
            <Plus className="h-4 w-4" />
            Create Coupon
          </button>
        </div>

        {/* Coupons List Table */}
        <div className="overflow-x-auto">
          {isCouponsLoading ? (
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
                <tr className="border-b border-border bg-muted/20 text-[10px] font-black uppercase tracking-wider text-muted-foreground/80">
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Applicability</th>
                  <th className="p-4">Usage Limit</th>
                  <th className="p-4">Expiration</th>
                  <th className="p-4">Target User</th>
                  <th className="p-4 text-center">Status</th>
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
                    <td className="p-4 max-w-[200px]">
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
                            {app.itemName || "Applicable Item"}
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
                      <button
                        onClick={() => toggleMutation.mutate(coupon.id)}
                        disabled={toggleMutation.isPending}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer select-none transition-all ${
                          coupon.isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                            : "bg-rose-50 dark:bg-rose-955/20 border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Coupon Dialog Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg bg-background border border-border rounded-2xl select-none p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-wider text-foreground">
              Create Discount Coupon
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure code, rates, expirations, applicability rules, and targeted student restrictions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCoupon} className="space-y-4 py-2">
            {/* Coupon Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Coupon Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="E.G. FESTIVE50"
                className="w-full px-3 h-10 text-xs font-bold uppercase tracking-wider border border-border rounded-xl bg-muted/10 focus:outline-none focus:border-violet-500 text-foreground"
                required
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
                  className="w-full px-3 h-10 text-xs font-bold border border-border rounded-xl bg-background focus:outline-none focus:border-violet-500 text-foreground"
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
                  placeholder={discountType === "PERCENTAGE" ? "E.G. 10" : "E.G. 500"}
                  className="w-full px-3 h-10 text-xs font-bold border border-border rounded-xl bg-muted/10 focus:outline-none focus:border-violet-500 text-foreground"
                  required
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

            {/* Targeted User / Student */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Targeted Student (User Specific)</span>
                <span className="text-[9px] font-bold text-amber-600 uppercase">Optional</span>
              </label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-3 h-10 text-xs font-bold border border-border rounded-xl bg-background focus:outline-none focus:border-violet-500 text-foreground"
              >
                <option value="">Global Coupon (All Students)</option>
                {studentList.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Applicability picker */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Applicable Programs (Courses / Test Series) *
              </label>
              <div className="border border-border rounded-xl p-3 max-h-[160px] overflow-y-auto space-y-2.5 bg-muted/10">
                
                {/* Courses section */}
                {courseList.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-violet-650 tracking-wider">Courses</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {courseList.map((course: Course) => {
                        const isChecked = selectedItems.some(
                          (item) => item.itemType === "COURSE" && item.referenceId === course.id
                        );
                        return (
                          <label 
                            key={course.id} 
                            className="flex items-center gap-2 text-[11px] font-bold text-foreground cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleItem("COURSE", course.id)}
                              className="h-3.5 w-3.5 rounded text-violet-605 border-border focus:ring-violet-500"
                            />
                            <span>{course.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Test Series section */}
                {testSeriesList.length > 0 && (
                  <div className="space-y-1 pt-1.5 border-t border-border/60">
                    <p className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Test Series</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {testSeriesList.map((ts: TestSeries) => {
                        const isChecked = selectedItems.some(
                          (item) => item.itemType === "TEST_SERIES" && item.referenceId === ts.id
                        );
                        return (
                          <label 
                            key={ts.id} 
                            className="flex items-center gap-2 text-[11px] font-bold text-foreground cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleItem("TEST_SERIES", ts.id)}
                              className="h-3.5 w-3.5 rounded text-violet-600 border-border focus:ring-violet-500"
                            />
                            <span>{ts.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 h-10 border border-border hover:bg-muted text-foreground font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer select-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center justify-center gap-1.5 px-6 h-10 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer select-none"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Coupon</span>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
