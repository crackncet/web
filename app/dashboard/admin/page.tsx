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
  TrendingUp,
  Settings,
  PlusCircle,
  FileText,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { data: user } = useUser();

  const stats = [
    {
      title: "Total Students",
      value: "1,248",
      description: "+12% from last month",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Active Courses",
      value: "14",
      description: "2 in preparation",
      icon: BookOpen,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Pending Queries",
      value: "8",
      description: "3 submitted today",
      icon: MessageSquare,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      title: "Monthly Revenue",
      value: "₹48,250",
      description: "+8.4% growth",
      icon: DollarSign,
      color: "text-purple-500 bg-purple-500/10",
    },
  ];

  const recentQueries = [
    {
      id: "1",
      user: "Aarav Sharma",
      subject: "Unable to load CBT test series dashboard",
      time: "2 hours ago",
      status: "pending",
    },
    {
      id: "2",
      user: "Priya Patel",
      subject: "Query regarding chemistry Chapter 3 material access",
      time: "4 hours ago",
      status: "pending",
    },
    {
      id: "3",
      user: "Rahul Verma",
      subject: "Refund request for course cancellation",
      time: "Yesterday",
      status: "reviewed",
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
      description: "View registration records and suspend/activate",
      url: "/dashboard/admin/users",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Welcome back, {user?.fullName || "Admin"}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here is a summary of what's happening at CrackNCET today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="cursor-pointer">
            <Link href="/dashboard/admin/analytics">
              <span>View Analytics Report</span>
              <TrendingUp className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-50">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <span>{stat.description}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions Panel */}
        <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Quick Shortcuts
            </CardTitle>
            <CardDescription>
              Launch tasks directly from your overview center
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.url}
                  className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 transition-all duration-200 group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <span>{action.title}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Queries Feed */}
        <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Recent Student Queries
              </CardTitle>
              <CardDescription>
                Unresolved inquiries needing attention
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="cursor-pointer text-slate-500 hover:text-slate-900">
              <Link href="/dashboard/admin/queries">
                <span>View All</span>
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentQueries.map((query) => (
              <div key={query.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-3">
                <div className="mt-1">
                  <span className={`inline-block h-2 w-2 rounded-full ${
                    query.status === "pending" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {query.subject}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 dark:text-slate-500">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {query.user}
                    </span>
                    <span>•</span>
                    <span>{query.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}