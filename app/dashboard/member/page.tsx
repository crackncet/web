"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  ArrowUpRight,
  TrendingUp,
  Settings,
  PlusCircle,
  Video,
  Database,
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
import { MemberHeader } from "./layout";

export default function MemberPage() {
  const { data: user } = useUser();

  const stats = [
    {
      title: "My Subjects",
      value: "4",
      description: "Assigned for teaching",
      icon: BookOpen,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "VOD Lectures",
      value: "28",
      description: "Published to subjects",
      icon: Video,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Handout Notes",
      value: "64",
      description: "PDFs & docs uploaded",
      icon: FileText,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      title: "Question Banks",
      value: "12",
      description: "Custom sets compiled",
      icon: Database,
      color: "text-purple-500 bg-purple-500/10",
    },
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
      description: "Compile and import markdown question pools",
      url: "/dashboard/member/question-banks",
      icon: Database,
    },
    {
      title: "Courses",
      description: "View assigned course timelines and syllabi",
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <MemberHeader>
        <span className="font-bold text-slate-800 dark:text-slate-200">Workspace Overview</span>
      </MemberHeader>

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Welcome back, {user?.fullName || "Team Member"}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Access your academic resources, manage assignments, and update media repositories.
          </p>
        </div>
        {user?.isHod && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Stream HOD
            </span>
          </div>
        )}
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

      {/* Quick Actions Panel */}
      <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Quick Shortcuts
          </CardTitle>
          <CardDescription>
            Direct access to core workspace actions
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
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-200 shrink-0">
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
    </div>
  );
}
