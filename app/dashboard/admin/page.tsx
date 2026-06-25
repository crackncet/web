"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  MessageSquare,
  DollarSign,
  ArrowUpRight,
  Settings,
  PlusCircle,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "./layout";
import { useUsersQuery } from "./users/_queries/users.queries";
import { useAdminCoursesQuery } from "./courses/_queries/courses.queries";
import { useAdminQueries } from "@/hooks/use-queries";
import { useAdminOrdersQuery } from "./finances/_queries/finances.queries";
import { useTeachingStaffQuery } from "./teachers/_queries/teachers.queries";

export default function AdminPage() {
  const { data: user } = useUser();

  // 1. Fetch real-time count of registered students
  const { data: usersData, isLoading: isUsersLoading } = useUsersQuery({
    page: 1,
    limit: 1,
    globalRole: "STUDENT",
  });

  // 2. Fetch real-time count of courses
  const { data: coursesData, isLoading: isCoursesLoading } = useAdminCoursesQuery({
    page: 1,
    limit: 1,
  });

  // 3. Fetch real-time count of support queries and recent entries
  const { data: queriesData, isLoading: isQueriesLoading } = useAdminQueries({
    page: 1,
    limit: 5,
    status: "PENDING",
  });

  // 4. Fetch real-time total transaction revenue
  const { data: ordersData, isLoading: isOrdersLoading } = useAdminOrdersQuery({
    page: 1,
    limit: 1,
  });

  // 5. Fetch active teaching staff & HODs roster
  const { data: staffData, isLoading: isStaffLoading } = useTeachingStaffQuery({
    page: 1,
    limit: 6,
  });

  const stats = [
    {
      title: "Total Students",
      value: usersData?.pagination?.total !== undefined ? usersData.pagination.total.toLocaleString("en-IN") : "0",
      description: "Registered student accounts",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
      isLoading: isUsersLoading,
    },
    {
      title: "Active Courses",
      value: coursesData?.meta?.total ?? 0,
      description: "Assigned syllabus tracks",
      icon: BookOpen,
      color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
      isLoading: isCoursesLoading,
    },
    {
      title: "Pending Queries",
      value: queriesData?.counts?.pending ?? 0,
      description: "Support requests needing answers",
      icon: MessageSquare,
      color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
      isLoading: isQueriesLoading,
    },
    {
      title: "All-time Revenue",
      value: ordersData?.analytics?.totalRevenue !== undefined ? `₹${Number(ordersData.analytics.totalRevenue).toLocaleString("en-IN")}` : "₹0",
      description: "Total orders volume",
      icon: DollarSign,
      color: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
      isLoading: isOrdersLoading,
    },
  ];

  const quickActions = [
    {
      title: "Add New Course",
      description: "Setup chapters, subjects & materials",
      url: "/dashboard/admin/courses",
      icon: PlusCircle,
    },
    {
      title: "Configure Metadata",
      description: "Manage stream names, exams & chapters",
      url: "/dashboard/admin/metadata",
      icon: Settings,
    },
    {
      title: "Create Test Series",
      description: "Setup mock questions and exams",
      url: "/dashboard/admin/test-series",
      icon: GraduationCap,
    },
    {
      title: "User Management",
      description: "View registration records and manage roles",
      url: "/dashboard/admin/users",
      icon: Users,
    },
    {
      title: "Finance & Orders",
      description: "Review transactions, billing & refunds",
      url: "/dashboard/admin/finances",
      icon: DollarSign,
    },
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
      <AdminHeader>
        <span className="font-extrabold text-slate-850 dark:text-white">Administration Dashboard</span>
      </AdminHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        
        {/* Left Column: Quick Actions Shortcuts */}
        <div className="lg:col-span-6 flex">
          <Card className="bg-white dark:bg-slate-900/40 shadow-xs border border-slate-200/50 dark:border-slate-800/40 w-full flex flex-col justify-between">
            <div>
              <CardHeader className="select-none pb-4">
                <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Workspace Shortcuts
                </CardTitle>
                <CardDescription className="text-xs text-slate-455 mt-0.5">
                  Launch management tasks directly from your overview center
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3.5 pb-6">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      href={action.url}
                      className="flex items-start gap-4 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 hover:border-slate-200 dark:hover:border-slate-700/60 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors flex items-center gap-1.5">
                          <span>{action.title}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all text-primary" />
                        </h4>
                        <p className="text-[10px] text-slate-455 dark:text-slate-500 mt-0.5 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Queries Feed */}
        <div className="lg:col-span-6 flex">
          <Card className="bg-white dark:bg-slate-900/40 shadow-xs border border-slate-200/50 dark:border-slate-800/40 w-full flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between pb-4 select-none">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Recent Student Queries
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-455 mt-0.5">
                    Unresolved support tickets needing attention
                  </CardDescription>
                </div>
                <Link href="/dashboard/admin/queries">
                  <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 text-slate-550 dark:text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <span>View All Queries</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 dark:divide-slate-800/40 pb-6">
                {isQueriesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="py-4 first:pt-0 last:pb-0 flex items-center gap-3 animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 bg-slate-150 dark:bg-slate-850 rounded" />
                        <div className="h-2.5 w-1/4 bg-slate-100 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                  ))
                ) : (queriesData?.queries || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 select-none">
                    <MessageSquare className="h-8 w-8 opacity-45 mb-1.5" />
                    <span className="text-xs font-bold">No pending queries</span>
                    <span className="text-[10px] text-slate-400/80 mt-0.5">All student support inquiries are answered!</span>
                  </div>
                ) : (
                  (queriesData?.queries || []).map((query) => (
                    <Link
                      key={query.id}
                      href="/dashboard/admin/queries"
                      className="block py-3.5 first:pt-0 last:pb-0 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 px-2 rounded-xl transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 shrink-0 select-none">
                          <span className={`inline-block h-2 w-2 rounded-full ${
                            query.status === "PENDING" ? "bg-amber-500" : "bg-emerald-500"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors truncate">
                            {query.subject}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-450 dark:text-slate-500">
                            <span className="font-bold text-slate-600 dark:text-slate-400">
                              {query.student?.fullName || "Student"}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3 shrink-0" />
                              {formatDate(query.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </div>
          </Card>
        </div>

      </div>

      {/* Teaching Staff & HODs Roster */}
      <Card className="bg-white dark:bg-slate-900/40 shadow-xs border border-slate-200/50 dark:border-slate-800/40">
        <CardHeader className="flex flex-row items-center justify-between pb-4 select-none">
          <div>
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Teaching Staff & HOD Roster
            </CardTitle>
            <CardDescription className="text-xs text-slate-455 mt-0.5">
              Assigned educators and stream assistants active on the platform
            </CardDescription>
          </div>
          <Link href="/dashboard/admin/teachers">
            <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 text-slate-550 dark:text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <span>Manage Faculty</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isStaffLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800/40 rounded-xl animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-slate-150 dark:bg-slate-800 rounded" />
                    <div className="h-2.5 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (staffData?.data || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 select-none">
              <Users className="h-8 w-8 opacity-45 mb-1.5" />
              <span className="text-xs font-bold">No active teaching staff found</span>
              <span className="text-[10px] text-slate-400/80 mt-0.5">Assign staff members to subjects to list them here.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(staffData?.data || []).map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800/30 bg-white/30 dark:bg-slate-900/10 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all"
                >
                  {staff.user?.profileImage ? (
                    <img
                      src={staff.user.profileImage}
                      alt={staff.user.fullName}
                      className="h-9 w-9 rounded-full bg-slate-100 object-cover shrink-0 select-none"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      {staff.user?.fullName?.[0]?.toUpperCase() || "T"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {staff.user?.fullName}
                    </h4>
                    <p className="text-[10px] text-slate-455 dark:text-slate-500 mt-0.5 truncate font-medium">
                      {staff.role} • {staff.subject?.name || "General"}
                    </p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
                      {staff.stream?.name || "No Stream"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}