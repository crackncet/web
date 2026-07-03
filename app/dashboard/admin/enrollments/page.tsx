"use client";

import React, { useState } from "react";
import { useEnrollmentsQuery } from "./_queries/enrollments.queries";
import { EnrollmentsFilters } from "./_components/enrollments-filters";
import { EnrollmentsTable } from "./_components/enrollments-table";
import { EnrollmentsPagination } from "./_components/enrollments-pagination";
import { GetEnrollmentsFilters } from "./_api/enrollments.api";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import { GraduationCap } from "lucide-react";

export default function EnrollmentsAdminPage() {
  const [filters, setFilters] = useState<GetEnrollmentsFilters>({
    page: 1,
    limit: 10,
    search: "",
    type: "",
    courseId: undefined,
    testSeriesId: undefined,
    status: "",
  });

  const { data, isLoading } = useEnrollmentsQuery(filters);

  const handleFilterChange = (updatedFilters: Partial<GetEnrollmentsFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...updatedFilters,
    }));
  };

  const totalCount = data?.total ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Portal Injection */}
      <AdminHeader>
        <div className="flex flex-col">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>ADMINISTRATION</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Enrollments</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Student Enrollments
          </h1>
        </div>
      </AdminHeader>

      {/* Stats Cards Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 rounded-xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Total Enrollments</p>
            <p className="text-3xl font-bold tracking-tight">{isLoading ? "..." : totalCount}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Unified Card Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
        {/* Filters bar header */}
        <EnrollmentsFilters filters={filters} onChange={handleFilterChange} />

        {/* Enrollments database table */}
        <EnrollmentsTable enrollments={data?.data || []} isLoading={isLoading} />

        {/* Pagination bar footer */}
        {data && (
          <EnrollmentsPagination
            page={data.page}
            limit={data.limit}
            totalPages={data.totalPages}
            total={data.total}
            onPageChange={(page) => handleFilterChange({ page })}
          />
        )}
      </div>
    </div>
  );
}
