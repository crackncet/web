"use client";

import React from "react";
import { Course } from "../_api/courses.api";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Tag, Eye, EyeOff, Sparkles } from "lucide-react";

interface AdminCourseCardProps {
  course: Course;
  examName: string;
}

export function AdminCourseCard({ course, examName }: AdminCourseCardProps) {
  const isPub = course.isPublished;
  const dateStr = `${new Date(course.startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${new Date(course.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <Card className="group overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-305 bg-white dark:bg-slate-900 flex flex-col h-full select-none">
      {/* Banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-850">
        {course.banner ? (
          <img
            src={course.banner}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-pink-500/10 flex items-center justify-center relative">
            <Sparkles className="h-8 w-8 text-primary/30 animate-pulse" />
            <div className="absolute bottom-2 right-2 text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">
              CrackNCET
            </div>
          </div>
        )}

        {/* Absolute Badges */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-white/95 text-slate-800 shadow-sm border border-slate-200/50 backdrop-blur-xs select-none">
            {examName}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {course.status === "ONGOING" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-505 bg-emerald-500 text-white shadow-sm select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Ongoing
            </span>
          )}
          {course.status === "UPCOMING" && (
            <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white shadow-sm select-none">
              Upcoming
            </span>
          )}
          {course.status === "COMPLETED" && (
            <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-600 text-white shadow-sm select-none">
              Completed
            </span>
          )}
          {course.status === "UNPUBLISHED" && (
            <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white shadow-sm select-none">
              Unpublished
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug line-clamp-1 group-hover:text-primary transition-colors duration-205">
            {course.title}
          </h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[34px]">
            {course.description || "No description provided for this course details."}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2.5">
          {/* Dates and Price */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary/70" />
              {dateStr}
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-100 text-xs">
              <Tag className="h-3.5 w-3.5 text-primary/70" />
              ₹{Number(course.price).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Visibility and Publication controls indicators */}
          <div className="flex items-center justify-between pt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Visibility:
            </span>
            <div className="flex items-center gap-1">
              {isPub ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <Eye className="h-3.5 w-3.5" />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-500 font-bold">
                  <EyeOff className="h-3.5 w-3.5" />
                  Hidden
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
