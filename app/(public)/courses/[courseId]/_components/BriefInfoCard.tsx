import React, { useState } from "react";
import Image from "next/image";
import { Tag, Play } from "lucide-react";

interface BriefInfoCardProps {
  coursePrice: string;
  testSeriesPrice: string | null;
  banner: string | null;
  title: string;
  testSeriesId: string | null;
}

export function BriefInfoCard({ coursePrice, testSeriesPrice, banner, title, testSeriesId }: BriefInfoCardProps) {
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    
    if (couponCode.trim().toUpperCase() === "NCET10") {
      setDiscountPercent(10);
      setCouponSuccess("Coupon Applied! 10% Discount active.");
    } else if (couponCode.trim().toUpperCase() === "WELCOME20") {
      setDiscountPercent(20);
      setCouponSuccess("Welcome Coupon Applied! 20% Discount active.");
    } else if (couponCode.trim() === "") {
      setCouponError("Please enter a coupon code");
    } else {
      setCouponError("Invalid coupon code");
      setDiscountPercent(0);
    }
  };

  const coursePriceNum = parseFloat(coursePrice) || 0;
  const testSeriesPriceNum = testSeriesPrice ? parseFloat(testSeriesPrice) : 0;
  const subtotalPrice = coursePriceNum + testSeriesPriceNum;
  const discountAmount = subtotalPrice * (discountPercent / 100);
  const finalPrice = subtotalPrice - discountAmount;

  return (
    <aside className="w-full lg:w-96 shrink-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs sticky top-24 self-start space-y-6 select-none">
      
      {/* Demo Video Aspect Ratio Box */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950 rounded-2xl border border-slate-850 group cursor-pointer shadow-sm">
        {banner ? (
          <Image
            src={banner}
            alt={title}
            fill
            className="object-cover opacity-60 group-hover:scale-102 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-indigo-900/60 to-purple-900/60" />
        )}
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-white dark:bg-slate-900 text-slate-955 dark:text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white tracking-wider">
          PREVIEW COURSE
        </div>
      </div>

      {/* Course Purchase Header */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Batch details</span>
        <h2 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide mt-0.5">
          {title}
        </h2>
      </div>

      {/* Price Calculations */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Course Base Price</span>
          <span className="font-bold text-slate-700 dark:text-slate-350">₹{coursePriceNum.toLocaleString("en-IN")}</span>
        </div>
        
        {testSeriesId && (
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Linked Test Series</span>
            <span className="text-emerald-600 dark:text-emerald-500 font-bold">
              {testSeriesPriceNum > 0 ? `+ ₹${testSeriesPriceNum.toLocaleString("en-IN")}` : "Free"}
            </span>
          </div>
        )}

        {discountPercent > 0 && (
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Discount ({discountPercent}%)</span>
            <span className="text-emerald-600 dark:text-emerald-500 font-bold">
              - ₹{discountAmount.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Final Price</span>
          <span className="text-lg font-black text-slate-950 dark:text-white">
            ₹{finalPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Coupon Application Form */}
      <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
          Apply Coupon
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. NCET10"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 h-9 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-slate-400 uppercase"
          />
          <button 
            type="submit" 
            className="h-9 px-4 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
        {couponError && (
          <span className="text-[10px] font-semibold text-red-500 block animate-in fade-in duration-150">
            {couponError}
          </span>
        )}
        {couponSuccess && (
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block animate-in fade-in duration-150">
            {couponSuccess}
          </span>
        )}
      </form>

      {/* CTA action button */}
      <div className="pt-2">
        <button 
          className="w-full h-11 bg-violet-600 hover:bg-violet-755 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Enroll Now</span>
        </button>
      </div>
      
    </aside>
  );
}
