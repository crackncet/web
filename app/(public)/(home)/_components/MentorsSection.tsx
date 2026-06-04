"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useMentors } from "../_queries/mentors.queries";
import { Mentors } from "../_api/mentors.api";
import { RetroCard } from "@/components/ui/retro-card";
import Image from "next/image";

const DUMMY_MENTORS: Mentors[] = [
  {
    fullName: "Dr. Aditya Sharma",
    profileImage: 'https://plus.unsplash.com/premium_photo-1661942126259-fb08e7cce1e2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dGVhY2hlcnN8ZW58MHx8MHx8fDA%3D',
    collegeName: "IIT Delhi",
    subjectName: "Physics",
    streamName: "Science",
  },
  {
    fullName: "Prof. Rajesh Kumar",
    profileImage: null,
    collegeName: "Delhi University",
    subjectName: "Teaching Aptitude",
    streamName: "Education",
  },
  {
    fullName: "Meenakshi Iyer",
    profileImage: null,
    collegeName: "JNU",
    subjectName: "English Literature",
    streamName: "Humanities",
  },
  {
    fullName: "Sanjay Singhania",
    profileImage: null,
    collegeName: "BITS Pilani",
    subjectName: "Mathematics",
    streamName: "Science",
  },
  {
    fullName: "Dr. Priya Patel",
    profileImage: null,
    collegeName: "BHU",
    subjectName: "Chemistry",
    streamName: "Science",
  },
];

export default function MentorsSection() {
  const { data, isLoading } = useMentors(1, 15);
  const [visibleCount, setVisibleCount] = useState(4);
  const [currentIndex, setCurrentIndex] = useState(0);

  const mentorsList = data?.mentors && data.mentors.length > 0 ? data.mentors : DUMMY_MENTORS;

  // Track swipe gestures on mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 768) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, mentorsList.length - visibleCount);
  const showNavigation = mentorsList.length > visibleCount;
  const shouldCenter = mentorsList.length < visibleCount;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // Keep index within bounds on resize/data updates
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < maxIndex) {
      setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-indigo-500 to-purple-600",
      "from-emerald-400 to-teal-600",
      "from-orange-400 to-red-500",
      "from-pink-500 to-rose-600",
      "from-cyan-500 to-blue-600",
    ];
    return colors[hash % colors.length];
  };

  if (isLoading) {
    return (
      <section className="relative w-full py-8 md:py-12 bg-primary-foreground dark:bg-slate-950/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header Skeleton */}
          <div className="text-center mb-12 md:mb-16 animate-pulse">
            <div className="h-4 bg-muted w-32 mx-auto rounded-md mb-3" />
            <div className="h-10 bg-muted w-64 md:w-96 mx-auto rounded-lg" />
          </div>

          {/* Cards Skeleton Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto pt-16">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="relative w-full h-[320px] pt-12">
                <div className="relative h-full bg-card border-0 rounded-[32px] overflow-visible flex flex-col p-6 pt-16 items-center justify-center animate-pulse shadow-sm">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-muted rounded-full shadow-sm" />
                  <div className="h-6 bg-muted rounded-md w-3/4 mb-3" />
                  <div className="h-4 bg-muted rounded-md w-1/2 mb-4" />
                  <div className="flex flex-col gap-1.5 items-center w-full">
                    <div className="h-5 bg-muted rounded-full w-24" />
                    <div className="h-5 bg-muted rounded-full w-20" />
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
    <section className="relative w-full py-8 md:py-12 bg-primary-foreground dark:bg-slate-950/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-sm md:text-base font-semibold text-primary tracking-widest uppercase mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            India's Elite Exam Crackers
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Meet Your <span className="text-primary">Mentors</span>
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
                aria-label="Previous Mentor"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-background border-2 border-slate-900 dark:border-slate-100 rounded-full shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[calc(50%+2px)] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
                aria-label="Next Mentor"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
              </button>
            </>
          )}

          {/* Slider viewport */}
          <div
            className="overflow-hidden w-full cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
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
              {mentorsList.map((mentor, index) => (
                <div
                  key={`${mentor.fullName}-${index}`}
                  style={{ width: `${100 / visibleCount}%` }}
                  className="shrink-0 px-3 py-4 flex"
                >
                  <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40">
                    {/* Profile Image (takes full size of the card) */}
                    <div className="absolute inset-0 w-full h-full">
                      {mentor.profileImage ? (
                        <Image
                          src={mentor.profileImage}
                          alt={mentor.fullName}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-tr ${getAvatarBg(mentor.fullName)} flex flex-col items-center justify-center p-4`}>
                          <span className="text-white text-4xl font-black tracking-tight mb-2">
                            {getInitials(mentor.fullName)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Gradient Overlay & Text Content (Fades in on hover) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-center items-center">
                      {/* Mentor Name */}
                      <h3 className="text-base md:text-lg font-black tracking-tight leading-snug mb-1 text-white line-clamp-1">
                        {mentor.fullName}
                      </h3>

                      {/* College Name */}
                      <div className="flex items-center justify-center gap-1 text-xs text-slate-200 font-semibold mb-3.5 w-full">
                        <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="line-clamp-1">{mentor.collegeName}</span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-col gap-1.5 items-center w-full">
                        <span className="px-3.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-primary/20 text-primary-foreground border border-primary/30 rounded-full text-center max-w-full truncate">
                          {mentor.subjectName}
                        </span>
                        <span className="px-3.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-center max-w-full truncate">
                          {mentor.streamName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}