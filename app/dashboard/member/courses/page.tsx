"use client";

import React, { useState, useEffect } from "react";
import { MemberHeader } from "../layout";
import { useMemberCoursesQuery } from "./_queries/courses.queries";
import { MemberCourseCard } from "./_components/member-course-card";
import {
  Search,
  BookOpen,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MemberCoursesPage() {
  const [page, setPage] = useState(1);
  const limit = 6; // Grid layout limit

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch assigned courses
  const { data: coursesData, isLoading: isCoursesLoading } = useMemberCoursesQuery({
    page,
    limit,
    query: debouncedQuery,
    status: selectedStatus === "ALL" ? "" : selectedStatus,
  });

  const courses = coursesData?.data || [];
  const meta = coursesData?.meta || {
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
  };

  // Pagination bounds calculation
  const startEntry = meta.total === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, meta.total);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedQuery("");
    setSelectedStatus("");
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val === "ALL" ? "" : val);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <MemberHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>WORKSPACE</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Courses</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Assigned Courses
          </h1>
        </div>
      </MemberHeader>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <div className="flex flex-1 items-center gap-3 w-full sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs rounded-lg"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleResetFilters}
            disabled={!searchTerm && !selectedStatus}
            className="h-10 w-10 shrink-0 border-slate-200 dark:border-slate-800 hover:bg-muted/10 rounded-lg"
            title="Reset Filters"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-full sm:w-48 shrink-0">
          <Select value={selectedStatus || "ALL"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm h-10 px-3 shadow-2xs rounded-lg">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="UNPUBLISHED">Unpublished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Courses Grid / Skeletons / Empty State */}
      {isCoursesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-card flex flex-col h-full animate-pulse select-none">
              <Skeleton className="aspect-video w-[90%] mx-auto mt-4 rounded-xl bg-muted/60" />
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="pt-4 border-t border-border mt-4 flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card className="border border-dashed border-border/80 bg-muted/5 py-12 flex flex-col items-center justify-center text-center p-6 select-none rounded-xl">
          <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/80">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-sm text-foreground">No Courses Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
            There are no assigned courses matching your query or selected filters. Try adjusting or resetting the active filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="mt-4 text-xs font-semibold"
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <MemberCourseCard
                key={course.id}
                course={course}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-900 rounded-xl select-none shadow-xs">
              <span className="text-xs sm:text-sm text-muted-foreground font-normal">
                Showing <span className="font-semibold text-foreground">{startEntry}</span> to{" "}
                <span className="font-semibold text-foreground">{endEntry}</span> of{" "}
                <span className="font-semibold text-foreground">{meta.total}</span> courses
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="h-8 text-xs font-bold gap-1 cursor-pointer border-border hover:bg-muted/10 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <div className="flex items-center justify-center px-3 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[2.25rem]">
                  {page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
                  disabled={page === meta.totalPages}
                  className="h-8 text-xs font-bold gap-1 cursor-pointer border-border hover:bg-muted/10 rounded-lg"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
