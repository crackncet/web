import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Tag, ArrowRight, Sparkles } from "lucide-react";
import { PublicCourseListItem } from "../_api/courses.api";

interface CourseCardProps {
  course: PublicCourseListItem;
}

export function CourseCard({ course }: CourseCardProps) {
  const formattedPrice = parseFloat(course.price).toLocaleString("en-IN");
  const dateStr = course.startDate
    ? new Date(course.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Flexible";

  const isUpcoming = course.status === "UPCOMING";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col h-full p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
      {/* Image Banner Inset */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-50 dark:bg-slate-800/40 rounded-xl">
        {course.banner ? (
          <Image
            src={course.banner}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-550 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/5 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-violet-600/20 animate-pulse" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800">
            {course.examName}
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5 z-10">
          <span
            className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded text-white shadow-sm ${
              isUpcoming 
                ? "bg-amber-500" 
                : "bg-emerald-600"
            }`}
          >
            {course.status}
          </span>
        </div>
      </div>

      {/* Content details Centered */}
      <div className="flex-1 flex flex-col justify-between mt-4">
        <div>
          <h3 className="text-center text-sm font-extrabold line-clamp-1 text-slate-900 dark:text-slate-50 group-hover:text-violet-600 transition-colors">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[32px] mt-2 px-2">
              {course.description}
            </p>
          )}

          {/* Stream Badges Centered */}
          <div className="flex flex-wrap gap-1 mt-4 justify-center">
            {course.streamName?.map((stream: string) => (
              <span
                key={stream}
                className="px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-750"
              >
                {stream}
              </span>
            ))}
          </div>
        </div>

        {/* Separator and Bottom Row */}
        <div>
          <div className="border-t border-slate-100 dark:border-slate-800/80 my-4" />
          
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              Starts: {dateStr}
            </span>
            <span className="inline-flex items-center gap-0.5 font-extrabold text-slate-800 dark:text-slate-50 text-sm">
              <Tag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              ₹{formattedPrice}
            </span>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            {course.isEnrollmentOpen ? (
              <Link href={`/courses/${course.id}`} className="block w-full">
                <button 
                  className="w-full h-10 text-xs font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-750 text-white flex items-center justify-center gap-1.5 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            ) : (
              <button 
                disabled
                className="w-full h-10 text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-not-allowed"
              >
                <span>Enrollment Closed</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
