"use client";

import React, { useState } from "react";
import { useMemberTeachingStaffQuery } from "./_queries/teachers.queries";
import { TeachersFilters } from "./_components/teachers-filters";
import { TeachersTable } from "./_components/teachers-table";
import { TeachersPagination } from "./_components/teachers-pagination";
import { GetTeachingStaffFilters } from "@/app/dashboard/admin/teachers/_api/teachers.api";
import { Users as UsersIcon, BookOpen, GraduationCap } from "lucide-react";
import { MemberHeader } from "../layout";
import { AssignTeacherDialog } from "./_components/assign-teacher-dialog";
import { useUser } from "@/hooks/use-user";

export default function TeachersMemberPage() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const [filters, setFilters] = useState<GetTeachingStaffFilters>({
    page: 1,
    limit: 10,
    search: undefined,
    role: undefined,
  });

  const { data, isLoading: isTableLoading } = useMemberTeachingStaffQuery(filters);

  const handleFilterChange = (updatedFilters: Partial<GetTeachingStaffFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...updatedFilters,
      page: updatedFilters.page !== undefined ? updatedFilters.page : 1,
    }));
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Guard: if user is not HOD, render access denied
  if (!user?.isHod) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white dark:bg-slate-900 border border-border rounded-xl">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Only Head of Departments (HOD) can manage teaching staff. If you believe this is an error, please contact your administrator.
        </p>
      </div>
    );
  }

  const totalCount = data?.pagination.total ?? 0;
  const teacherCount = data?.data.filter(s => s.role === "TEACHER").length ?? 0;
  const taCount = data?.data.filter(s => s.role === "TA").length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Portal Injection */}
      <MemberHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>WORKSPACE</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Teachers</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Teachers Management
          </h1>
        </div>
        <div>
          <AssignTeacherDialog />
        </div>
      </MemberHeader>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Total Teaching Staff */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-xs select-none">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Managed Staff
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

      {/* Main Table Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
        {/* Filters bar header */}
        <TeachersFilters filters={filters} onChange={handleFilterChange} />

        {/* Teachers database table */}
        <TeachersTable staffList={data?.data || []} isLoading={isTableLoading} />

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
