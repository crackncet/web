"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  HelpCircle,
  MessageSquare,
  Plus,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  MessageCircle,
  GraduationCap,
  Flame,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentHeader } from "./layout";
import { useStudentCoursesQuery } from "./my-courses/_queries/my-courses.queries";
import { useStudentTestSeriesQuery } from "./my-test-series/_queries/my-test-series.queries";
import { useStudentDoubtsQuery } from "./doubts/_queries/doubts.queries";
import { useStudentQueries } from "@/hooks/use-queries";
import { useUser } from "@/hooks/use-user";

export default function StudentDashboardPage() {
  // 1. Fetch Student Data
  const { data: user } = useUser();
  const { data: coursesResponse, isLoading: isLoadingCourses } = useStudentCoursesQuery();
  const { data: testSeriesResponse, isLoading: isLoadingTestSeries } = useStudentTestSeriesQuery();
  const { data: doubtsResponse, isLoading: isLoadingDoubts } = useStudentDoubtsQuery({ page: 1, limit: 3 });
  const { data: queriesResponse, isLoading: isLoadingQueries } = useStudentQueries({ page: 1, limit: 3 });

  const courses = coursesResponse?.data || [];
  const testSeriesList = testSeriesResponse?.data || [];
  const doubts = doubtsResponse?.data || [];
  const queries = queriesResponse?.queries || [];

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Student";

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  // Helper styles for doubt statuses
  const getDoubtStatusStyle = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/25";
      case "CLAIMED":
        return "bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/25";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/25";
    }
  };

  // Helper styles for query statuses
  const getQueryStatusStyle = (status: string) => {
    switch (status) {
      case "RESPONDED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/25";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/25";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Dynamic top bar header portal */}
      <StudentHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500 shrink-0" />
          <span className="font-extrabold text-slate-850 dark:text-white select-none">Student Workspace</span>
        </div>
      </StudentHeader>

      {/* Vedic Wisdom Slogan Section at the Top */}
      <div className="w-full text-center py-2 select-none space-y-1">
        <p className="text-lg md:text-xl font-bold text-violet-600 dark:text-violet-400 tracking-wide font-serif">
          दुर्लभान्यपि कार्याणि सिध्यन्ति प्रोद्यमेन हि।
        </p>
        <p className="text-xs md:text-sm font-semibold text-muted-foreground italic">
          "Impossible tasks can be accomplished through effort."
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Courses & Doubts (span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ongoing Courses Section */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2 select-none">
                <BookOpen className="h-4.5 w-4.5 text-violet-500" />
                Ongoing Course
              </h2>
              {courses.length > 0 && (
                <Link
                  href="/dashboard/student/my-courses"
                  className="text-[11px] font-bold text-violet-500 hover:text-violet-600 flex items-center gap-0.5"
                >
                  View All ({courses.length})
                  <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {/* Courses Content */}
            {isLoadingCourses ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-xl p-4">
                <BookOpen className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <h3 className="text-xs font-bold text-foreground">No enrolled courses</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                  You are not enrolled in any study courses. Contact admin to subscribe to a classroom program.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.slice(0, 1).map((course) => (
                  <div
                    key={course.courseId}
                    className="relative overflow-hidden group border border-violet-100 dark:border-violet-950 bg-gradient-to-br from-violet-50/20 via-white to-violet-50/5 dark:from-violet-950/5 dark:via-slate-900/10 dark:to-transparent hover:border-violet-500/30 rounded-2xl p-5 md:p-6 transition-all duration-205 flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    {/* Background blob/glow effect */}
                    <div className="absolute right-0 top-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-violet-400/5 blur-3xl pointer-events-none group-hover:bg-violet-400/15 transition-all duration-300" />

                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                          {course.examName}
                        </span>
                        <h3 className="text-base font-extrabold text-foreground tracking-tight line-clamp-1 mt-1.5 group-hover:text-violet-500 transition-colors">
                          {course.title}
                        </h3>
                        {course.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                            {course.description}
                          </p>
                        )}
                      </div>

                      <Link href={`/dashboard/student/my-courses/${course.courseId}`} className="block w-full max-w-[160px]">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full justify-between font-bold text-xs rounded-lg h-9 px-4 cursor-pointer bg-violet-600 hover:bg-violet-750 text-white"
                        >
                          <span>Go to Classroom</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </Link>
                    </div>

                    {/* Progress indicator with 3D Image Illustration */}
                    <div className="flex items-center gap-6 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 pt-5 md:pt-0 md:pl-6">
                                 
                      {/* Image illustration */}
                      <div className="relative w-30 h-30 shrink-0 hidden sm:block">
                        <img
                          src="/course_progress_art.png"
                          alt="Course Progress illustration"
                          className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doubt Desk (Recent Doubts) Section */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2 select-none">
                <HelpCircle className="h-4.5 w-4.5 text-violet-500" />
                Recent Doubts
              </h2>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/student/doubts"
                  className="text-[11px] font-bold text-violet-500 hover:text-violet-600 flex items-center gap-0.5"
                >
                  Doubt Desk
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Doubts Content */}
            {isLoadingDoubts ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : doubts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-xl p-4">
                <HelpCircle className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <h3 className="text-xs font-bold text-foreground">No doubts submitted</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                  Have doubts in your syllabus or practice tests? Instantly raise them with our expert instructors.
                </p>
                <Link href="/dashboard/student/doubts" className="mt-3">
                  <Button size="xs" className="gap-1 rounded-lg text-[10px] font-bold">
                    <Plus className="h-3.5 w-3.5" />
                    Ask Doubt
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {doubts.map((doubt) => (
                  <Link
                    key={doubt.id}
                    href={`/dashboard/student/doubts/${doubt.id}`}
                    className="block group border border-border/70 hover:border-violet-500/25 bg-muted/5 dark:bg-slate-900/10 hover:bg-violet-500/5 rounded-xl p-4 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      {/* Soft icon wrapper on left */}
                      <div className="p-3 bg-violet-100/60 text-violet-600 dark:bg-violet-950 dark:text-violet-400 rounded-xl shrink-0 group-hover:bg-violet-200/50 group-hover:text-violet-750 transition-colors">
                        <HelpCircle className="h-5 w-5" />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span className="bg-muted px-1.5 py-0.5 rounded border border-border text-slate-500 font-semibold select-none">
                            {doubt.type}
                          </span>
                          {doubt.subject && (
                            <span className="text-violet-500 font-semibold truncate max-w-[120px]">
                              {doubt.subject.name}
                            </span>
                          )}
                          <span className="text-slate-400 font-medium select-none">
                            {new Date(doubt.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-foreground group-hover:text-violet-500 transition-colors truncate">
                          {doubt.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate leading-relaxed">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 select-none">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${getDoubtStatusStyle(
                            doubt.status
                          )}`}
                        >
                          {doubt.status === "UNASSIGNED" ? "open" : doubt.status === "CLAIMED" ? "claimed" : "resolved"}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Upcoming Tests & Queries (span-1) */}
        <div className="space-y-6">
          
          {/* Upcoming Tests Section */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2 select-none">
                <Calendar className="h-4.5 w-4.5 text-violet-500" />
                Upcoming Tests
              </h2>
              {testSeriesList.length > 0 && (
                <Link
                  href="/dashboard/student/my-test-series"
                  className="text-[11px] font-bold text-violet-500 hover:text-violet-600 flex items-center gap-0.5"
                >
                  All Series
                  <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {/* Tests Content */}
            {isLoadingTestSeries ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : testSeriesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border rounded-xl p-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <h3 className="text-xs font-bold text-foreground">No test series</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
                  You are not enrolled in any mock test schedules.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {testSeriesList.slice(0, 1).map((ts) => (
                  <div
                    key={ts.testSeriesId}
                    className="group border border-border/70 rounded-2xl p-5 bg-muted/5 dark:bg-slate-900/10 hover:border-violet-500/25 transition-all duration-200 space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2 select-none">
                        <span className="text-violet-500 font-semibold">{ts.examName}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-semibold bg-emerald-55 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400">ACTIVE</span>
                      </div>
                      <h4 className="text-xs font-black text-foreground tracking-tight line-clamp-1">
                        {ts.name}
                      </h4>
                    </div>

                    

                    <Link href={`/dashboard/student/my-test-series/${ts.testSeriesId}`} className="w-full block">
                      <Button
                        variant="outline"
                        size="xs"
                        className="w-full justify-center gap-1.5 font-bold text-[10px] rounded-lg h-9 cursor-pointer border-violet-200 text-violet-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-colors"
                      >
                        <span>View Schedules</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Support Queries Section */}
          <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2 select-none">
                <MessageSquare className="h-4.5 w-4.5 text-violet-500" />
                Support Queries
              </h2>
              <Link
                href="/dashboard/student/queries"
                className="text-[11px] font-bold text-violet-500 hover:text-violet-600 flex items-center gap-0.5"
              >
                Queries Page
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Queries Content */}
            {isLoadingQueries ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : queries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border rounded-xl p-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <h3 className="text-xs font-bold text-foreground">No queries logged</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">
                  Need technical help or support? Log a query with administration.
                </p>
                <Link href="/dashboard/student/queries" className="mt-3">
                  <Button size="xs" className="gap-1 rounded-lg text-[10px] font-bold">
                    <Plus className="h-3.5 w-3.5" />
                    New Ticket
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {queries.slice(0, 1).map((q) => (
                  <Link
                    key={q.id}
                    href="/dashboard/student/queries"
                    className="block group border border-border/70 hover:border-violet-500/25 bg-muted/5 dark:bg-slate-900/10 hover:bg-violet-500/5 rounded-xl p-4 transition-all duration-200"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[9px] font-semibold text-muted-foreground">
                        <span className="text-slate-400 select-none">
                          {new Date(q.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${getQueryStatusStyle(
                            q.status
                          )}`}
                        >
                          {q.status === "RESPONDED" ? "responded" : "pending"}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100 group-hover:text-violet-500 transition-colors truncate">
                          {q.subject}
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-relaxed mt-0.5">
                          {q.message}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}

                <Link
                  href="/dashboard/student/queries"
                  className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-violet-500 hover:text-violet-600 pt-2 border-t border-slate-100 dark:border-slate-800/80 transition-colors"
                >
                  <span>View All Queries</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>



    </div>
  );
}