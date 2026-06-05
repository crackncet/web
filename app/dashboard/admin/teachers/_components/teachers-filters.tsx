"use client";

import React, { useState, useEffect } from "react";
import { Search, RotateCcw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GetTeachingStaffFilters } from "../_api/teachers.api";
import { useStreamsQuery } from "../../metadata/_queries/streams.queries";

interface TeachersFiltersProps {
  filters: GetTeachingStaffFilters;
  onChange: (updated: Partial<GetTeachingStaffFilters>) => void;
}

export function TeachersFilters({ filters, onChange }: TeachersFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const { data: streams, isLoading: isStreamsLoading } = useStreamsQuery();

  // Keep local search value in sync with prop updates (e.g. on reset)
  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ search: searchValue.trim() || undefined, page: 1 });
  };

  const handleRoleChange = (value: string) => {
    onChange({ role: value === "ALL" ? undefined : value, page: 1 });
  };

  const handleStreamChange = (value: string) => {
    onChange({ streamId: value === "ALL" ? undefined : value, page: 1 });
  };

  const handleReset = () => {
    setSearchValue("");
    onChange({
      search: undefined,
      role: undefined,
      streamId: undefined,
      page: 1,
    });
  };

  const roleValue = filters.role || "ALL";
  const streamValue = filters.streamId || "ALL";

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border-b border-border bg-card">
      {/* Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, subject..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 h-9 w-full bg-muted/20 border-border focus-visible:ring-primary/20 text-sm"
          />
        </div>
        <Button type="submit" size="sm" className="h-9 px-4 cursor-pointer text-xs font-medium shrink-0">
          Search
        </Button>
      </form>

      {/* Select Dropdowns & Reset */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
        {/* Stream Filter */}
        <Select value={streamValue} onValueChange={handleStreamChange}>
          <SelectTrigger className="h-9 w-[150px] border-border text-xs text-muted-foreground">
            <SelectValue placeholder="Filter by Stream" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Streams</SelectItem>
            {isStreamsLoading ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              streams?.map((stream) => (
                <SelectItem key={stream.id} value={stream.id}>
                  {stream.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Role Select */}
        <Select value={roleValue} onValueChange={handleRoleChange}>
          <SelectTrigger className="h-9 w-[130px] border-border text-xs text-muted-foreground">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="TA">Teaching Asst.</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {(filters.search || filters.role || filters.streamId) && (
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
  );
}
