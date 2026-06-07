"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import { useAdminCoursesQuery, useFeaturedCoursesQuery } from "./_queries/courses.queries";
import { useExamsQuery } from "../metadata/_queries/exams.queries";
import {
  Search,
  BookOpen,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star
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
import { AdminCourseCard } from "./_components/admin-course-card";
import { CreateCourseDialog } from "./_components/create-course-dialog";

export default function CourseAdminPage() {
  const [page, setPage] = useState(1);
  const limit = 6; // Grid layout limit

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Queries
  const { data: exams } = useExamsQuery({ isActive: true });
  const { data: responseData, isLoading: isCoursesLoading, isPlaceholderData } = useAdminCoursesQuery({
    page,
    limit,
    query: debouncedQuery || undefined,
    examId: selectedExamId || undefined,
    status: (selectedStatus as any) || undefined,
  });

  const { data: featuredData, isLoading: isFeaturedLoading } = useFeaturedCoursesQuery();

  const courses = responseData?.data || [];
  const featuredCourses = featuredData?.data || [];

  const meta = responseData?.meta || {
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
    availableStatuses: [],
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedExamId("");
    setSelectedStatus("");
    setPage(1);
  };

  const handleExamChange = (val: string) => {
    setSelectedExamId(val === "ALL" ? "" : val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val === "ALL" ? "" : val);
    setPage(1);
  };

  const getExamName = (examId: string) => {
    return exams?.find((e) => e.id === examId)?.name || "Exam";
  };

  // Pagination details
  const startEntry = (meta.page - 1) * meta.limit + 1;
  const endEntry = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AdminHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
          <div className="flex flex-col">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
              <span>Administration</span>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/90">Courses</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
              Course Management
            </h1>
          </div>
          <CreateCourseDialog />
        </div>
      </AdminHeader>

      {/* Featured Courses Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 select-none">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <h2 className="text-sm font-bold tracking-tight text-foreground">Featured Courses</h2>
          <span className="text-[10px] font-semibold text-muted-foreground/60 px-1.5 py-0.5 rounded-md bg-muted uppercase tracking-wider">
            {featuredCourses.length}
          </span>
        </div>

        {isFeaturedLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="overflow-hidden border border-amber-250/30 dark:border-amber-900/20 bg-amber-50/5 dark:bg-amber-955/5 flex flex-col h-full animate-pulse">
                <Skeleton className="aspect-video w-full rounded-none bg-muted/60" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : featuredCourses.length === 0 ? (
          <Card className="border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 p-5 text-center select-none rounded-xl">
            <p className="text-xs text-muted-foreground">
              No featured courses. Star mark any active, published course below to showcase it.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((fc) => {
              const fullCourse = courses.find((c) => c.id === fc.id) || {
                ...fc,
                examId: "",
                testSeriesId: null,
                endDate: fc.startDate,
                status: "ONGOING" as const,
                isActive: true,
                isPublished: true,
                isFeatured: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                streams: fc.streams || [],
              };
              return (
                <AdminCourseCard
                  key={fc.id}
                  course={fullCourse}
                  examName={fc.examName}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 select-none">
        <div className="flex flex-1 items-center gap-3 w-full md:max-w-md">
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
            disabled={!searchTerm && !selectedExamId && !selectedStatus}
            className="h-10 w-10 shrink-0 border-slate-200 dark:border-slate-800 hover:bg-muted/10 rounded-lg"
            title="Reset Filters"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <div className="w-full sm:w-48">
            <Select value={selectedExamId || "ALL"} onValueChange={handleExamChange}>
              <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm h-10 px-3 shadow-2xs rounded-lg">
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Exams</SelectItem>
                {exams?.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
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
      </div>

      {/* Courses Grid / Skeletons / Empty State */}
      {isCoursesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-card flex flex-col h-full animate-pulse select-none">
              <Skeleton className="aspect-video w-full rounded-none bg-muted/60" />
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
            There are no courses matching your query or selected filters. Try adjusting or resetting the active filters.
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
              <AdminCourseCard
                key={course.id}
                course={course}
                examName={getExamName(course.examId)}
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
                  disabled={page <= 1 || isPlaceholderData}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="cursor-pointer gap-1 border-border h-9 text-muted-foreground hover:text-foreground font-semibold"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    const isCurrent = pageNum === page;
                    return (
                      <Button
                        key={pageNum}
                        variant={isCurrent ? "default" : "outline"}
                        size="sm"
                        disabled={isPlaceholderData}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 cursor-pointer font-semibold ${
                          !isCurrent ? "border-border text-muted-foreground hover:text-foreground" : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages || isPlaceholderData}
                  onClick={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
                  className="cursor-pointer gap-1 border-border h-9 text-muted-foreground hover:text-foreground font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}