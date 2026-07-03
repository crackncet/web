"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnrollmentsPaginationProps {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function EnrollmentsPagination({
  page,
  limit,
  totalPages,
  total,
  onPageChange,
}: EnrollmentsPaginationProps) {
  if (totalPages <= 1) return null;

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-border bg-card">
      {/* Entry status description */}
      <span className="text-xs sm:text-sm text-muted-foreground font-normal">
        Showing <span className="font-medium text-foreground">{startEntry}</span> to{" "}
        <span className="font-medium text-foreground">{endEntry}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> entries
      </span>

      {/* Nav Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="cursor-pointer gap-1 border-border h-9 text-muted-foreground hover:text-foreground font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {/* Dynamic page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNum = index + 1;
            const isCurrent = pageNum === page;
            return (
              <Button
                key={pageNum}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={`w-9 h-9 cursor-pointer font-medium ${
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
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="cursor-pointer gap-1 border-border h-9 text-muted-foreground hover:text-foreground font-medium"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
