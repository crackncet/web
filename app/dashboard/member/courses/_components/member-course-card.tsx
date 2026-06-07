"use client";

import React from "react";
import { MemberCourse } from "../_api/courses.api";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Tag, Sparkles, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MemberCourseCardProps {
  course: MemberCourse;
}

export function MemberCourseCard({ course }: MemberCourseCardProps) {
  const dateStr = `${new Date(course.startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${new Date(course.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  // Active status shadow and motion configuration
  const shadowClass = course.isActive
    ? "shadow-[0_8px_30px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_30px_rgba(16,185,129,0.02)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] hover:-translate-y-1 transition-all duration-300"
    : "shadow-[0_8px_30px_rgba(239,68,68,0.06)] dark:shadow-[0_8px_30px_rgba(239,68,68,0.02)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.12)] hover:-translate-y-1 transition-all duration-300";

  return (
    <Card className={`group overflow-hidden border-0 bg-white dark:bg-slate-900 flex flex-col h-full select-none ${shadowClass}`}>
      
      {/* Banner - Centered 90% Width */}
      <div className="w-full pt-4 px-4 flex justify-center">
        <div className="relative aspect-video w-[90%] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 shadow-xs">
          {course.banner ? (
            <Image
              src={course.banner}
              alt={course.title}
              loading="lazy"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-103"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/5 flex items-center justify-center relative">
              <Sparkles className="h-6 w-6 text-primary/30 animate-pulse" />
            </div>
          )}

          {/* Absolute Badges on Image */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <span className="inline-flex px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-white/95 text-slate-800 shadow-xs border border-slate-200/40 backdrop-blur-xs select-none">
              {course.examName}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold rounded bg-slate-950/85 text-white backdrop-blur-xs select-none uppercase tracking-wider shadow-xs">
              {course.status}
            </span>
          </div>

          {/* Gold Star indicator if featured */}
          {course.isFeatured && (
            <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-amber-500 text-white shadow-sm border border-amber-500 z-10">
              <Star className="h-3 w-3 fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Details Card Content - Overlapping bottom of image area */}
      <CardContent className="relative bg-white dark:bg-slate-900 pt-5 px-5 pb-5 flex-1 flex flex-col justify-between -mt-4 z-20">
        
        {/* Slanted corner cut-in notch SVG */}
        <svg 
          className="absolute -top-2.5 left-0 w-full h-3 text-white dark:text-slate-900 fill-current pointer-events-none z-10" 
          viewBox="0 0 100 10" 
          preserveAspectRatio="none"
        >
          <path d="M0 0 L15 0 L22 10 L78 10 L85 0 L100 0 L100 10 L0 10 Z" />
        </svg>

        <div className="space-y-3.5 mt-1">
          {/* Centered Course Name & Active Status Dot */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className={`h-2 w-2 rounded-full shrink-0 ${course.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
            </div>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
              course.isActive 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}>
              {course.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Centered Description */}
          <p className="text-center text-[11px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[34px] px-1">
            {course.description || "No description provided for this course details."}
          </p>

          {/* Divider Line */}
          <div className="w-full h-px bg-slate-100 dark:bg-slate-800/60 my-3" />

          {/* Stream Tags & Test Series Badge */}
          <div className="space-y-2 flex flex-col items-center justify-center">
            {/* Stream Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[20px]">
              {course.streams && course.streams.length > 0 ? (
                course.streams.map((stream, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-800/40"
                  >
                    {stream}
                  </span>
                ))
              ) : (
                <span className="text-[9px] text-muted-foreground/45 italic">No streams</span>
              )}
            </div>

            {/* Test Series Badge */}
            {course.testSeriesTitle && (
              <div className="inline-flex items-center gap-1 text-[9px] bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-150 dark:border-slate-800/40">
                <BookOpen className="h-3 w-3 text-primary/70" />
                <span className="font-bold text-[8px] uppercase tracking-wider text-primary/80">Test Series:</span>
                <span className="font-semibold truncate max-w-[180px]">{course.testSeriesTitle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dates and Price */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-3.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5 text-primary/70" />
              {dateStr}
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-100 text-xs">
              <Tag className="h-3.5 w-3.5 text-primary/70" />
              ₹{Number(course.price).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Action Button */}
          <div className="pt-0.5">
            <Button 
              className="w-full text-xs font-bold h-9.5 hover:bg-primary/95 cursor-pointer shadow-2xs transition-all duration-200 rounded-xl"
            >
              View Course Workspace
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
