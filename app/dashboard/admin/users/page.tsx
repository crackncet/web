"use client";

import React, { useState } from "react";
import { useUsersQuery } from "./_queries/users.queries";
import { UsersFilters } from "./_components/users-filters";
import { UsersTable } from "./_components/users-table";
import { UsersPagination } from "./_components/users-pagination";
import { GetUsersFilters } from "./_api/users.api";
import { Users as UsersIcon, Plus, CheckCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import StatsSection from "./_components/StatsSection";

export default function UsersAdminPage() {
  const [filters, setFilters] = useState<GetUsersFilters>({
    page: 1,
    limit: 10,
    query: "",
    globalRole: undefined,
    isActive: undefined,
  });

  const { data, isLoading } = useUsersQuery(filters);

  const handleFilterChange = (updatedFilters: Partial<GetUsersFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...updatedFilters,
    }));
  };

  const totalCount = data?.pagination.total ?? 0;
  const activePercent = totalCount > 0 ? "98.4%" : "100%";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Portal Injection */}
      <AdminHeader>
        <div className="flex flex-col">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>Members</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Users</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Users
          </h1>
        </div>
        
      </AdminHeader>

      <StatsSection totalCount={totalCount} activePercent={activePercent} />

      {/* Main Unified Card Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
        {/* Filters bar header */}
        <UsersFilters filters={filters} onChange={handleFilterChange} />

        {/* User database table */}
        <UsersTable users={data?.users || []} isLoading={isLoading} />

        {/* Pagination bar footer */}
        {data?.pagination && (
          <UsersPagination
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
