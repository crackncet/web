"use client";

import React, { useState } from "react";
import { useAdminOrdersQuery } from "./_queries/finances.queries";
import { FinancesFilters } from "./_components/finances-filters";
import { FinancesTable } from "./_components/finances-table";
import { FinancesStats } from "./_components/finances-stats";
import { FinancesPagination } from "./_components/finances-pagination";
import { GetAdminOrdersFilters } from "./_api/finances.api";
import { AdminHeader } from "@/app/dashboard/admin/layout";

export default function FinancesAdminPage() {
  const [filters, setFilters] = useState<GetAdminOrdersFilters>({
    page: 1,
    limit: 10,
    query: "",
    status: undefined,
    itemType: undefined,
    startDate: undefined,
    endDate: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading } = useAdminOrdersQuery(filters);

  const handleFilterChange = (updatedFilters: Partial<GetAdminOrdersFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...updatedFilters,
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Portal Injection */}
      <AdminHeader>
        <div className="flex flex-col">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>ADMINISTRATION</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Finances</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Finances & Transactions
          </h1>
        </div>
      </AdminHeader>

      {/* Date-wise and Type-wise Insights Card grid */}
      <FinancesStats analytics={data?.analytics} />

      {/* Main Unified Card Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
        {/* Filters, search, dates, sorting bar */}
        <FinancesFilters
          filters={filters}
          itemTypes={data?.itemTypes || ["COURSE", "TEST_SERIES"]}
          onChange={handleFilterChange}
        />

        {/* Database orders ledger table */}
        <FinancesTable orders={data?.orders || []} isLoading={isLoading} />

        {/* Pagination footer */}
        {data?.pagination && (
          <FinancesPagination
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
