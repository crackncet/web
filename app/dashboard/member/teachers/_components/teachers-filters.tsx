"use client";

import React, { useState } from "react";
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
import { GetTeachingStaffFilters } from "@/app/dashboard/admin/teachers/_api/teachers.api";

interface TeachersFiltersProps {
  filters: GetTeachingStaffFilters;
  onChange: (updatedFilters: Partial<GetTeachingStaffFilters>) => void;
}

export function TeachersFilters({ filters, onChange }: TeachersFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ search: searchInput.trim() || undefined });
  };

  const handleClear = () => {
    setSearchInput("");
    onChange({
      search: undefined,
      role: undefined,
    });
  };

  return (
    <div className="p-4 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 select-none">
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full"
      >
        {/* Search input with form submit */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, college or subject..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-background border-border text-xs w-full h-8"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Role Filter */}
          <Select
            value={filters.role || "ALL"}
            onValueChange={(val) =>
              onChange({ role: val === "ALL" ? undefined : val })
            }
          >
            <SelectTrigger className="w-[130px] bg-background border-border text-xs h-8">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Roles</SelectItem>
              <SelectItem value="TEACHER" className="text-xs">TEACHER</SelectItem>
              <SelectItem value="TA" className="text-xs">TA</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {(filters.search || filters.role) && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 text-muted-foreground border-border hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Search trigger button */}
          <Button type="submit" size="sm" className="h-8 font-semibold text-xs cursor-pointer">
            Apply Filters
          </Button>
        </div>
      </form>
    </div>
  );
}
