"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GetEnrollmentsFilters } from "../_api/enrollments.api";
import { useAdminCoursesQuery } from "../../courses/_queries/courses.queries";
import { useAdminTestSeriesQuery } from "../../test-series/_queries/test-series.queries";

interface EnrollmentsFiltersProps {
  filters: GetEnrollmentsFilters;
  onChange: (updated: Partial<GetEnrollmentsFilters>) => void;
}

export function EnrollmentsFilters({ filters, onChange }: EnrollmentsFiltersProps) {
  const { data: coursesData } = useAdminCoursesQuery({ page: 1, limit: 100 });
  const { data: testSeriesData } = useAdminTestSeriesQuery({ page: 1, limit: 100 });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ search: e.target.value, page: 1 });
  };

  const handleTypeChange = (value: string) => {
    onChange({
      type: (value === "ALL" ? "" : value) as any,
      courseId: undefined,
      testSeriesId: undefined,
      page: 1,
    });
  };

  const handleCourseChange = (value: string) => {
    onChange({ courseId: value === "ALL" ? undefined : value, page: 1 });
  };

  const handleTestSeriesChange = (value: string) => {
    onChange({ testSeriesId: value === "ALL" ? undefined : value, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    onChange({ status: (value === "ALL" ? "" : value) as any, page: 1 });
  };

  const handleReset = () => {
    onChange({
      search: "",
      type: "",
      courseId: undefined,
      testSeriesId: undefined,
      status: "",
      page: 1,
    });
  };

  const hasActiveFilters =
    !!filters.search ||
    !!filters.type ||
    !!filters.courseId ||
    !!filters.testSeriesId ||
    !!filters.status;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border-b border-border bg-card">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by student name, email..."
          value={filters.search || ""}
          onChange={handleSearchChange}
          className="pl-9 h-9 w-full bg-muted/20 border-border focus-visible:ring-primary/20 text-sm"
        />
      </div>

      {/* Select Dropdowns & Reset */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
        {/* Type Select */}
        <Select value={filters.type || "ALL"} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-9 w-[130px] border-border text-xs text-muted-foreground">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="COURSE">Course</SelectItem>
            <SelectItem value="TEST_SERIES">Test Series</SelectItem>
          </SelectContent>
        </Select>

        {/* Course Select (Conditional) */}
        {filters.type === "COURSE" && (
          <Select value={filters.courseId || "ALL"} onValueChange={handleCourseChange}>
            <SelectTrigger className="h-9 w-[180px] border-border text-xs text-muted-foreground">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Courses</SelectItem>
              {coursesData?.data.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Test Series Select (Conditional) */}
        {filters.type === "TEST_SERIES" && (
          <Select value={filters.testSeriesId || "ALL"} onValueChange={handleTestSeriesChange}>
            <SelectTrigger className="h-9 w-[180px] border-border text-xs text-muted-foreground">
              <SelectValue placeholder="Select Test Series" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Test Series</SelectItem>
              {testSeriesData?.data.map((ts) => (
                <SelectItem key={ts.id} value={ts.id}>
                  {ts.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status Select */}
        <Select value={filters.status || "ALL"} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-9 w-[130px] border-border text-xs text-muted-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="REVOKED">Revoked</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleReset}
            size="sm"
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
