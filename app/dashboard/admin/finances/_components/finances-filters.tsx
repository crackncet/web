"use client";

import React from "react";
import { Search, RotateCcw, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GetAdminOrdersFilters } from "../_api/finances.api";

interface FinancesFiltersProps {
  filters: GetAdminOrdersFilters;
  itemTypes: string[];
  onChange: (updated: Partial<GetAdminOrdersFilters>) => void;
}

export function FinancesFilters({ filters, itemTypes, onChange }: FinancesFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ query: e.target.value, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    onChange({ status: value === "ALL" ? undefined : value, page: 1 });
  };

  const handleItemTypeChange = (value: string) => {
    onChange({ itemType: value === "ALL" ? undefined : value, page: 1 });
  };

  const handleReset = () => {
    onChange({
      query: "",
      status: undefined,
      itemType: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
    });
  };

  const hasActiveFilters =
    !!filters.query ||
    !!filters.status ||
    !!filters.itemType ||
    !!filters.startDate ||
    !!filters.endDate ||
    filters.sortBy !== "createdAt" ||
    filters.sortOrder !== "desc";

  return (
    <div className="flex flex-col gap-4 p-5 border-b border-border bg-card">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by student, email, Order ID, item name..."
            value={filters.query || ""}
            onChange={handleSearchChange}
            className="pl-9 h-9 w-full bg-muted/20 border-border focus-visible:ring-primary/20 text-sm rounded-lg"
          />
        </div>

        {/* Date Filters & Reset */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground select-none">From:</span>
            <Input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => onChange({ startDate: e.target.value || undefined, page: 1 })}
              className="h-9 w-[130px] bg-muted/20 border-border text-xs text-muted-foreground focus-visible:ring-primary/20 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground select-none">To:</span>
            <Input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => onChange({ endDate: e.target.value || undefined, page: 1 })}
              className="h-9 w-[130px] bg-muted/20 border-border text-xs text-muted-foreground focus-visible:ring-primary/20 rounded-lg cursor-pointer"
            />
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleReset}
              size="sm"
              className="h-9 gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer text-xs font-normal"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/50 pt-4">
        {/* Status Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Status:</span>
          <Select value={filters.status || "ALL"} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-[130px] border-border text-xs text-muted-foreground bg-card rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="CREATED">Created</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Item Type Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Item Type:</span>
          <Select value={filters.itemType || "ALL"} onValueChange={handleItemTypeChange}>
            <SelectTrigger className="h-8 w-[135px] border-border text-xs text-muted-foreground bg-card rounded-lg">
              <SelectValue placeholder="Item Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Item Types</SelectItem>
              {itemTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sorting controls */}
        <div className="flex items-center gap-2 ml-0 sm:ml-auto">
          <span className="text-xs font-medium text-muted-foreground">Sort By:</span>
          <Select
            value={filters.sortBy || "createdAt"}
            onValueChange={(val) => onChange({ sortBy: val as any, page: 1 })}
          >
            <SelectTrigger className="h-8 w-[130px] border-border text-xs text-muted-foreground bg-card rounded-lg">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="amount">Order Amount</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc", page: 1 })}
            className="h-8 w-8 p-0 border-border cursor-pointer text-muted-foreground hover:text-foreground rounded-lg"
            title={filters.sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
