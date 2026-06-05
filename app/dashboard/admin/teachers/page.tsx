"use client";

import React, { useState } from "react";
import { useTeachingStaffQuery } from "./_queries/teachers.queries";
import { TeachersFilters } from "./_components/teachers-filters";
import { TeachersTable } from "./_components/teachers-table";
import { TeachersPagination } from "./_components/teachers-pagination";
import { GetTeachingStaffFilters } from "./_api/teachers.api";
import { Users as UsersIcon, BookOpen, GraduationCap, School } from "lucide-react";
import { AdminHeader } from "@/app/dashboard/admin/layout";

export default function TeachersAdminPage() {
  const [filters, setFilters] = useState<GetTeachingStaffFilters>({
    page: 1,
    limit: 10,
    search: undefined,
    role: undefined,
    streamId: undefined,
  });

  const { data, isLoading } = useTeachingStaffQuery(filters);

  const handleFilterChange = (updatedFilters: Partial<GetTeachingStaffFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...updatedFilters,
      // Default to page 1 unless page is explicitly changed
      page: updatedFilters.page !== undefined ? updatedFilters.page : 1,
    }));
  };

  const totalCount = data?.pagination.total ?? 0;

  // Simple, elegant stats counters
  const teacherCount = data?.data.filter(s => s.role === "TEACHER").length ?? 0;
  const taCount = data?.data.filter(s => s.role === "TA").length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Portal Injection */}
      <AdminHeader>
        <div className="flex flex-col">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>ADMINISTRATION</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Teachers</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Teachers
          </h1>
        </div>
      </AdminHeader>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Total Teaching Staff */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-xs select-none">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Teaching Staffs
            </p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {totalCount}
            </p>
          </div>
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
            <UsersIcon className="h-4 w-4" />
          </div>
        </div>

        {/* Stat 2: Active Teachers */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-xs select-none">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Teachers (Page)
            </p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {teacherCount}
            </p>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <GraduationCap className="h-4 w-4" />
          </div>
        </div>

        {/* Stat 3: Active TAs */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-xs select-none">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Teaching Assistants (Page)
            </p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {taCount}
            </p>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
            <BookOpen className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Unified Card Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
        {/* Filters bar header */}
        <TeachersFilters filters={filters} onChange={handleFilterChange} />

        {/* Teachers database table */}
        <TeachersTable staffList={data?.data || []} isLoading={isLoading} />

        {/* Pagination bar footer */}
        {data?.pagination && (
          <TeachersPagination
            page={data.pagination.page}
            limit={data.pagination.limit}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            onPageChange={(page) => handleFilterChange({ page })}
          />
        )}
      </div>
    </div>
  );
}
