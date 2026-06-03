"use client";

import React, { useState, useEffect } from "react";
import { Calendar, ArrowRight, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { FeaturedCourse } from "../_api/courses.api";
import Link from "next/link";

const DUMMY_COURSES: FeaturedCourse[] = [
  {
    id: "dummy-1",
    examName: "NCET 2026",
    title: "Crack NCET Integrated B.Ed Special Batch",
    description: "Complete preparation syllabus coverage for Domain subjects, Teaching Aptitude, and Language tests with full-length Computer Based Tests.",
    banner: null,
    price: "4999.00",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "dummy-2",
    examName: "NCET 2026",
    title: "Teaching Aptitude & General Test Masterclass",
    description: "Master high-scoring sections with video lessons, daily practice banks, and targeted tests from top teaching faculty.",
    banner: null,
    price: "1999.00",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: "dummy-3",
    examName: "NCET 2026",
    title: "NCET Full Length CBT Test Series",
    description: "Get real test-day environment with 15+ mock computer-based tests designed strictly on the latest NCET patterns.",
    banner: null,
    price: "999.00",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
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
                <div className="absolute inset-0 bg-muted/20 rounded-[24px] border-2 border-dashed border-muted translate-x-2 translate-y-2" />
                <div className="relative h-full bg-background border-2 border-muted rounded-[24px] overflow-hidden flex flex-col p-6 animate-pulse">
                  <div className="aspect-video bg-muted rounded-xl mb-4" />
                  <div className="h-6 bg-muted rounded-md w-3/4 mb-3" />
                  <div className="h-4 bg-muted rounded-md w-full mb-2" />
                  <div className="h-4 bg-muted rounded-md w-5/6 mb-4" />
                  <div className="mt-auto pt-4 border-t border-muted/30 flex justify-between items-center">
                    <div className="h-8 bg-muted rounded-md w-20" />
                    <div className="h-10 bg-muted rounded-md w-24" />
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
    <section className="relative w-full py-16 md:py-24 bg-gradient-to-b from-slate-50/30 to-background dark:from-slate-950/10 overflow-hidden">
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
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-background border-2 border-slate-900 dark:border-slate-100 rounded-full shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[calc(50%+2px)] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
                aria-label="Previous Course"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-background border-2 border-slate-900 dark:border-slate-100 rounded-full shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[calc(50%+2px)] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
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
                const formattedDate = course.startDate
                  ? new Date(course.startDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : null;

                return (
                  <div
                    key={course.id}
                    style={{ width: `${100 / visibleCount}%` }}
                    className="shrink-0 px-3 md:px-4 py-4 flex"
                  >
                    <div className="relative group w-full flex">
                      {/* Hand-drawn offset shadow */}
                      <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5 rounded-[24px] border-2 border-slate-900 dark:border-slate-100 translate-x-2 translate-y-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 pointer-events-none" />

                      {/* Main Course Card */}
                      <div className="relative flex flex-col w-full bg-background border-2 border-slate-900 dark:border-slate-100 rounded-[24px] overflow-hidden transition-all duration-300">
                        {/* Banner Image or Gradient Fallback */}
                        <div className="relative w-full aspect-video border-b-2 border-slate-900 dark:border-slate-100 bg-gradient-to-tr from-violet-600 via-indigo-600 to-primary flex items-center justify-center overflow-hidden">
                          {course.banner ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={course.banner}
                              alt={course.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                              <BookOpen className="w-10 h-10 text-white/40 mb-2" />
                              <span className="text-white/80 font-black tracking-widest text-xs uppercase bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                {course.examName}
                              </span>
                            </div>
                          )}

                          {/* Floating Badge for Exam Name */}
                          {course.banner && (
                            <div className="absolute top-3 left-3 bg-amber-400 dark:bg-amber-500 text-slate-950 px-3 py-1 text-xs font-black uppercase rounded-full border-2 border-slate-900 dark:border-slate-950 shadow-sm z-10">
                              {course.examName}
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="flex-1 flex flex-col p-6">
                          {/* Start Date */}
                          {formattedDate && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-3">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Starts: {formattedDate}</span>
                            </div>
                          )}

                          {/* Title */}
                          <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug mb-2 group-hover:text-primary transition-colors min-h-[3rem] line-clamp-2">
                            {course.title}
                          </h3>

                          {/* Description */}
                          {course.description && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-3 mb-6 min-h-[3.25rem]">
                              {course.description}
                            </p>
                          )}

                          {/* Footer price and CTA */}
                          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-900/60 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">
                                Price
                              </span>
                              <span className="text-base md:text-lg font-black text-slate-900 dark:text-slate-100">
                                ₹{formattedPrice}
                              </span>
                            </div>

                            <Link href={`/courses/${course.id}`}>
                              <button className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground font-black text-2xs md:text-xs uppercase border-2 border-slate-900 dark:border-slate-950 rounded-xl hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all duration-200">
                                <span>Explore</span>
                                <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
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