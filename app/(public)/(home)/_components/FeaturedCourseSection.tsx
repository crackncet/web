"use client";

import React, { useState, useEffect } from "react";
import { Calendar, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Sparkles, Tag } from "lucide-react";
import { FeaturedCourse } from "../_api/courses.api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const DUMMY_COURSES: FeaturedCourse[] = [
  {
    id: "dummy-1",
    examName: "NCET 2026",
    title: "Crack NCET Integrated B.Ed Special Batch",
    description: "Complete preparation syllabus coverage for Domain subjects, Teaching Aptitude, and Language tests with full-length Computer Based Tests.",
    banner: null,
    price: "4999.00",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    streams: ["BSc", "BEd", "BCom"],
  },
  {
    id: "dummy-2",
    examName: "NCET 2026",
    title: "Teaching Aptitude & General Test Masterclass",
    description: "Master high-scoring sections with video lessons, daily practice banks, and targeted tests from top teaching faculty.",
    banner: null,
    price: "1999.00",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    streams: ["BA", "BEd"],
  },
  {
    id: "dummy-3",
    examName: "NCET 2026",
    title: "NCET Full Length CBT Test Series",
    description: "Get real test-day environment with 15+ mock computer-based tests designed strictly on the latest NCET patterns.",
    banner: null,
    price: "999.00",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    streams: ["BSc", "BA", "BCom"],
  }
];

interface FeaturedCourseSectionProps {
  courses: FeaturedCourse[];
  isLoading: boolean;
}

export default function FeaturedCourseSection({
  courses,
  isLoading,
}: FeaturedCourseSectionProps) {
  const [visibleCount, setVisibleCount] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayCourses = courses.length > 0 ? courses : DUMMY_COURSES;

  // Track viewport changes to adjust number of grid columns shown
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Recalculate index bounds if visible columns change
  const maxIndex = Math.max(0, displayCourses.length - visibleCount);
  const showNavigation = displayCourses.length > visibleCount;
  const shouldCenter = displayCourses.length < visibleCount;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // Keep currentIndex in bounds if dataset size or columns change
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  // Loading skeletons matching the layout
  if (isLoading) {
    return (
      <section className="relative w-full pt-8 md:pt-12 bg-gradient-to-b from-slate-50/30 to-background dark:from-slate-950/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header Skeleton */}
          <div className="text-center mb-12 md:mb-16 animate-pulse">
            <div className="h-4 bg-muted w-32 mx-auto rounded-md mb-3" />
            <div className="h-10 bg-muted w-64 md:w-96 mx-auto rounded-lg" />
          </div>

          {/* Cards Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="relative w-full h-[400px]">
                <div className="relative h-full w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col p-5 animate-pulse shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                  <div className="w-[90%] mx-auto mt-2 aspect-video bg-muted rounded-xl mb-4" />
                  <div className="h-5 bg-muted rounded-md w-3/4 mx-auto mb-3" />
                  <div className="h-4 bg-muted rounded-md w-1/2 mx-auto mb-4" />
                  <div className="h-4 bg-muted rounded-md w-full mb-2" />
                  <div className="h-4 bg-muted rounded-md w-5/6 mx-auto mb-4" />
                  <div className="mt-auto pt-4 border-t border-muted/25 flex justify-between items-center">
                    <div className="h-5 bg-muted rounded-md w-20" />
                    <div className="h-9 bg-muted rounded-md w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full py-8 md:py-12 bg-gradient-to-b from-slate-50/30 to-background dark:from-slate-950/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm md:text-base font-semibold text-primary tracking-widest uppercase mb-2">
            Specially Selected for You
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Featured <span className="text-primary">Courses</span>
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto px-4 md:px-12">
          {/* Navigation Buttons */}
          {showNavigation && (
            <>
              {/* Left Arrow */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-25 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-background border-2 border-slate-900 dark:border-slate-100 rounded-full shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[calc(50%+2px)] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
                aria-label="Previous Course"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-25 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-background border-2 border-slate-900 dark:border-slate-100 rounded-full shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[calc(50%+2px)] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
                aria-label="Next Course"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
              </button>
            </>
          )}

          {/* Slider viewport */}
          <div className="overflow-hidden w-full">
            <div
              className={`flex transition-transform duration-500 ease-in-out ${
                shouldCenter ? "justify-center" : ""
              }`}
              style={{
                transform: shouldCenter
                  ? "none"
                  : `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              }}
            >
              {displayCourses.map((course) => {
                const formattedPrice = parseFloat(course.price).toLocaleString("en-IN");
                const dateStr = course.startDate
                  ? `Starts: ${new Date(course.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`
                  : "Flexible Dates";

                const shadowClass = "shadow-[0_8px_30px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_30px_rgba(16,185,129,0.02)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] hover:-translate-y-1 transition-all duration-300";

                return (
                  <div
                    key={course.id}
                    style={{ width: `${100 / visibleCount}%` }}
                    className="shrink-0 px-3 md:px-4 py-4 flex"
                  >
                    <Card className={`group overflow-hidden border-0 bg-white dark:bg-slate-900 flex flex-col h-full w-full select-none ${shadowClass}`}>
                      
                      {/* Banner - Centered 90% Width */}
                      <div className="w-full pt-4 px-4 flex justify-center">
                        <div className="relative aspect-video w-[90%] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 shadow-xs">
                          {course.banner ? (
                            <Image
                              src={course.banner}
                              alt={course.title}
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
                            
                          </div>
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
                          {/* Centered Course Name */}
                          <div className="text-center space-y-1">
                            <div className="flex items-center justify-center">
                              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                                {course.title}
                              </h3>
                            </div>
                          </div>

                          {/* Centered Description */}
                          {course.description && (
                            <p className="text-center text-[11px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[34px] px-1">
                              {course.description}
                            </p>
                          )}

                          {/* Divider Line */}
                          <div className="w-full h-px bg-slate-100 dark:bg-slate-800/60 my-3.5" />

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
                              ₹{formattedPrice}
                            </span>
                          </div>

                          {/* Explore CTA Button */}
                          <div className="pt-0.5">
                            <Link href={`/courses/${course.id}`} className="w-full block">
                              <Button 
                                className="w-full text-xs font-bold h-9.5 cursor-pointer shadow-2xs transition-colors rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-1.5"
                              >
                                <span>Explore</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}