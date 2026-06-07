"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCourseDetailQuery } from "../_queries/courses.queries";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Sparkles,
  Tag,
  Users,
  Shield,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export default function AdminCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: response, isLoading, error } = useCourseDetailQuery(courseId);
  const course = response?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <Skeleton className="h-8 w-1/4 rounded-lg bg-muted/60" />
        <Skeleton className="h-64 w-full rounded-2xl bg-muted/60" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 col-span-2 rounded-2xl bg-muted/60" />
          <Skeleton className="h-48 rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 select-none">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Course Not Found</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-2 leading-relaxed">
          The course you are looking for does not exist or has been deleted.
        </p>
        <Link href="/dashboard/admin/courses" className="mt-5">
          <Button variant="outline" className="text-xs font-bold gap-1 rounded-xl">
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  const dateStr = course.startDate
    ? `${new Date(course.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} - ${new Date(course.endDate || "").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
    : "Flexible Dates";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminHeader>
        <div className="flex items-center gap-3 w-full">
          <Link href="/dashboard/admin/courses">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
              <span>Administration</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/90">Courses</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-foreground select-none mt-0.5">
              Course Details
            </h1>
          </div>
        </div>
      </AdminHeader>

      {/* Course Banner/Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-6 p-6">
        <div className="relative aspect-video w-full md:w-64 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 shadow-xs">
          {course.banner ? (
            <Image
              src={course.banner}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 256px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/5 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary/30 animate-pulse" />
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`inline-flex px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-xs backdrop-blur-xs select-none ${
              course.isActive
                ? "bg-emerald-500/95 text-white"
                : "bg-rose-500/95 text-white"
            }`}>
              {course.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
              {course.title}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {course.description || "No description provided for this course workspace."}
            </p>
          </div>

          <div className="flex flex-wrap gap-y-3 gap-x-6 text-[11px] text-muted-foreground pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
              {dateStr}
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
              <Tag className="h-4 w-4 text-primary/70 shrink-0" />
              ₹{Number(course.price).toLocaleString("en-IN")}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Shield className="h-4 w-4 text-primary/70 shrink-0" />
              System Status: {course.isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>
      </div>

      {/* Streams & Subjects Tree */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase select-none flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-primary" />
          Course Curriculum
        </h3>

        {course.streams.length === 0 ? (
          <Card className="border border-dashed border-border/80 bg-muted/5 py-12 flex flex-col items-center justify-center text-center p-6 select-none rounded-2xl">
            <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/80">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-sm text-foreground">No Streams Linked</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
              There are no streams associated with this course yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {course.streams.map((stream) => (
              <div key={stream.streamId} className="space-y-3">
                {/* Stream Header */}
                <div className="flex flex-row items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-black text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      {stream.streamName}
                    </h4>
                    
                  </div>
                </div>

                {/* Stream Subjects Table */}
                {stream.subjects.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950/10">
                    <p className="text-xs text-muted-foreground font-medium">
                      No subjects or staff assigned to this stream in this course yet.
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      Stream HOD is responsible for assigning subjects and faculty.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200/60 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-slate-955/20 hover:bg-slate-50/50 dark:hover:bg-slate-955/20 border-b border-slate-205 dark:border-slate-800">
                          <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">Subject</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">Assigned Faculty</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4">Role</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase text-slate-400 tracking-wider h-10 px-4 text-right">View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stream.subjects.map((sub) => (
                          <TableRow key={sub.courseSubjectId} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/30 dark:hover:bg-slate-800/20">
                            <TableCell className="align-middle px-4 py-3">
                              <span className="text-xs font-bold text-slate-850 dark:text-slate-250">
                                {sub.subjectName}
                              </span>
                            </TableCell>
                            <TableCell className="align-middle px-4 py-3">
                              {sub.staff.length === 0 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-semibold bg-rose-500/5 px-2 py-0.5 rounded-md border border-rose-500/10">
                                  <AlertCircle className="h-3 w-3 shrink-0" />
                                  No faculty
                                </span>
                              ) : (
                                <div className="flex flex-col gap-1.5">
                                  {sub.staff.map((staffMember) => (
                                    <div
                                      key={staffMember.id}
                                      className="h-[18px] flex items-center gap-1.5"
                                    >
                                      <div className="relative h-4 w-4 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                                        {staffMember.profileImage ? (
                                          <Image
                                            src={staffMember.profileImage}
                                            alt={staffMember.fullName}
                                            fill
                                            className="object-cover"
                                          />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center text-[7px] font-bold text-primary">
                                            {staffMember.fullName
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")}
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">
                                        {staffMember.fullName}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="align-middle px-4 py-3">
                              {sub.staff.length === 0 ? (
                                <span className="text-xs text-muted-foreground/45 select-none">—</span>
                              ) : (
                                <div className="flex flex-col gap-1.5">
                                  {sub.staff.map((staffMember) => (
                                    <div key={staffMember.id} className="h-[18px] flex items-center">
                                      <span className={`px-1 py-0.2 rounded text-[7px] font-extrabold uppercase tracking-wider ${
                                        staffMember.role === "TEACHER"
                                          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                      }`}>
                                        {staffMember.role}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="align-middle px-4 py-3 text-right">
                              <Link href={`/dashboard/admin/courses/${courseId}/subjects/${sub.courseSubjectId}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-[10px] font-bold h-7.5 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer rounded-lg inline-flex items-center gap-1 select-none"
                                >
                                  View
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
