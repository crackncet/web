import React, { useState } from "react";
import Image from "next/image";

interface BriefInfoCardProps {
  price: string;
  banner: string | null;
  title: string;
  onEnrollClick: () => void;
}

export function BriefInfoCard({ price, banner, title, onEnrollClick }: BriefInfoCardProps) {

  const basePriceNum = parseFloat(price) || 0;

  return (
    <aside className="w-full lg:w-96 shrink-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs sticky top-24 self-start space-y-6 select-none">
      
      {/* Banner Aspect Ratio Box */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        {banner ? (
          <Image
            src={banner}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-indigo-900/20 to-purple-900/20" />
        )}
      </div>

      {/* Title */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Test Series details</span>
        <h2 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide mt-0.5">
          {title}
        </h2>
      </div>

      {/* Price Calculations */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Base Price</span>
          <span className="font-bold text-slate-700 dark:text-slate-350">₹{basePriceNum.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* CTA action button */}
      <div className="pt-2">
        <button 
          onClick={onEnrollClick}
          className="w-full h-11 bg-violet-600 hover:bg-violet-755 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Enroll Now</span>
        </button>
      </div>
      
    </aside>
  );
}
