"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Video,
  Database,
  FileText,
  HelpCircle,
  Clock,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MemberHeader } from "./layout";
import { useMemberCoursesQuery, useTeachingStaffListQuery } from "./courses/_queries/courses.queries";
import { useTeacherQueueQuery } from "./doubts/_queries/doubts.queries";

export default function MemberPage() {
  const { data: user } = useUser();

  // 1. Fetch real-time count of active assigned courses
  const { data: coursesData, isLoading: isCoursesLoading } = useMemberCoursesQuery({
    page: 1,
    limit: 3, // Show top 3 on dashboard
  });

  // 2. Fetch real-time count of pending/claimed doubts
  const { data: queueData, isLoading: isQueueLoading } = useTeacherQueueQuery({
    page: 1,
    limit: 3, // Show top 3 on dashboard
  });

  // 3. Fetch teaching staff roster if HOD
  const { data: staffData, isLoading: isStaffLoading } = useTeachingStaffListQuery(
    undefined,
    undefined,
    !!user?.isHod
  );

  const stats = [
    {
      title: "Assigned Courses",
      value: coursesData?.meta?.total ?? 0,
      description: "Active courses you instruct",
      icon: BookOpen,
      color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
      isLoading: isCoursesLoading,
    },
    {
      title: "Pending Doubts",
      value: queueData?.meta?.pagination?.total ?? 0,
      description: "Doubts in your subjects",
      icon: HelpCircle,
      color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
      isLoading: isQueueLoading,
    },
    ...(user?.isHod
      ? [
          {
            title: "Department Staff",
            value: staffData?.data?.length ?? 0,
            description: "Instructors in your stream",
            icon: Users,
            color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
            isLoading: isStaffLoading,
          },
        ]
      : []),
  ];

  const quickActions = [
    {
      title: "Media Library",
      description: "Upload and publish lecture videos or notes",
      url: "/dashboard/member/media",
      icon: Video,
    },
    {
      title: "Question Banks",
      description: "Compile and import question pools",
      url: "/dashboard/member/question-banks",
      icon: Database,
    },
    {
      title: "Courses",
      description: "View assigned course timelines and chapters",
      url: "/dashboard/member/courses",
      icon: BookOpen,
    },
    ...(user?.isHod
      ? [
          {
            title: "Manage Teaching Staff",
            description: "Assign subject teachers and add candidates",
            url: "/dashboard/member/teachers",
            icon: Users,
          },
        ]
      : []),
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300 px-1">
      <MemberHeader>
        <span className="font-extrabold text-slate-850 dark:text-white">Workspace Overview</span>
      </MemberHeader>


      {/* Stats Summary Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-white dark:bg-slate-900/40 shadow-xs border border-slate-200/50 dark:border-slate-800/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {stat.isLoading ? (
                  <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-50">
                    {stat.value}
                  </div>
                )}
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Info Queue (Left) & Utilities (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Doubts and Courses Preview */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Read-only Doubts Preview */}
          <Card className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4 select-none">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Pending Doubt desk Queue
                </CardTitle>
                <CardDescription className="text-xs text-slate-450 mt-0.5">
                  Latest unanswered doubts in your assigned subjects
                </CardDescription>
              </div>
              <Link href="/dashboard/member/doubts">
                <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 text-slate-550 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <span>View All Queue</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {isQueueLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-2 animate-pulse">
                    <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-3/4 bg-slate-150 dark:bg-slate-800/60 rounded" />
                  </div>
                ))
              ) : queueData?.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 select-none">
                  <HelpCircle className="h-8 w-8 opacity-45 mb-1.5" />
                  <span className="text-xs font-bold">Queue is empty</span>
                  <span className="text-[10px] text-slate-400/80 mt-0.5">All student doubts are answered!</span>
                </div>
              ) : (
                queueData?.data.map((doubt) => (
                  <Link
                    key={doubt.id}
                    href={`/dashboard/member/doubts/${doubt.id}`}
                    className="block p-4 border border-slate-100 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700/60 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 select-none">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-655 dark:text-slate-350">
                          {doubt.subject?.name || "Support"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          doubt.status === "UNASSIGNED"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                        }`}>
                          {doubt.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(doubt.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 group-hover:text-primary transition-colors truncate">
                        {doubt.title}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1 leading-normal">
                        {doubt.description}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Assigned Courses List Preview */}
          <Card className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4 select-none">
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Assigned Courses Timeline
                </CardTitle>
                <CardDescription className="text-xs text-slate-450 mt-0.5">
                  Latest courses you have teaching assignments in
                </CardDescription>
              </div>
              <Link href="/dashboard/member/courses">
                <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 text-slate-550 dark:text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <span>View All Courses</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {isCoursesLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-2 animate-pulse">
                    <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-1/2 bg-slate-150 dark:bg-slate-800/60 rounded" />
                  </div>
                ))
              ) : (coursesData?.data || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 select-none">
                  <BookOpen className="h-8 w-8 opacity-45 mb-1.5" />
                  <span className="text-xs font-bold">No courses assigned</span>
                  <span className="text-[10px] text-slate-400/80 mt-0.5">You are not linked to any active courses.</span>
                </div>
              ) : (
                (coursesData?.data || []).map((course) => (
                  <Link
                    key={course.id}
                    href={`/dashboard/member/courses/${course.id}`}
                    className="block p-4 border border-slate-100 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700/60 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 select-none">
                        {course.examName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium select-none">
                        Ends: {formatDate(course.endDate)}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 group-hover:text-primary transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5">
                          Status: <span className="font-bold text-slate-600 dark:text-slate-400">{course.status}</span>
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-350 dark:text-slate-650 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Shortcuts & HOD roster */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Shortcuts panel */}
          <Card className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-xs">
            <CardHeader className="pb-3 select-none">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Workspace Shortcuts
              </CardTitle>
              <CardDescription className="text-xs text-slate-450 mt-0.5">
                Direct links to workspace libraries
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.url}
                    className="flex items-start gap-3.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 hover:border-slate-200 dark:hover:border-slate-700/60 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>{action.title}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all text-primary" />
                      </h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 truncate leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Department Staff List (HOD only) */}
          {user?.isHod && (
            <Card className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3 select-none">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Teaching Staff
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-450 mt-0.5">
                    Roster of stream faculty members
                  </CardDescription>
                </div>
                <Link href="/dashboard/member/teachers">
                  <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 text-slate-550 dark:text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <span>Manage</span>
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {isStaffLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-850" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-1/2 bg-slate-150 dark:bg-slate-800 rounded" />
                        <div className="h-2.5 w-1/3 bg-slate-100 dark:bg-slate-800/60 rounded" />
                      </div>
                    </div>
                  ))
                ) : (staffData?.data || []).length === 0 ? (
                  <div className="text-center py-6 text-slate-400 select-none">
                    <Users className="h-7 w-7 opacity-40 mx-auto mb-1" />
                    <p className="text-[10px] font-bold">No teachers registered</p>
                  </div>
                ) : (
                  (staffData?.data || []).slice(0, 4).map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/30 bg-white/30 dark:bg-slate-900/10"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {staff.user?.profileImage ? (
                          <img
                            src={staff.user.profileImage}
                            alt={staff.user.fullName}
                            className="h-8 w-8 rounded-full bg-slate-100 object-cover shrink-0 select-none"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-750 dark:text-violet-300 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                            {staff.user?.fullName?.[0]?.toUpperCase() || "T"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {staff.user?.fullName}
                          </h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">
                            {staff.role} • {staff.subject?.name || "General"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
