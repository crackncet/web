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
import { GetUsersFilters } from "../_api/users.api";

interface UsersFiltersProps {
  filters: GetUsersFilters;
  onChange: (updated: Partial<GetUsersFilters>) => void;
}

export function UsersFilters({ filters, onChange }: UsersFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ query: e.target.value, page: 1 });
  };

  const handleRoleChange = (value: string) => {
    onChange({ globalRole: value === "ALL" ? undefined : value, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    const isActive =
      value === "ACTIVE" ? true : value === "SUSPENDED" ? false : undefined;
    onChange({ isActive, page: 1 });
  };

  const handleReset = () => {
    onChange({
      query: "",
      globalRole: undefined,
      isActive: undefined,
      page: 1,
    });
  };

  const statusValue =
    filters.isActive === true
      ? "ACTIVE"
      : filters.isActive === false
      ? "SUSPENDED"
      : "ALL";

  const roleValue = filters.globalRole || "ALL";

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border-b border-border bg-card">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, email, phone..."
          value={filters.query || ""}
          onChange={handleSearchChange}
          className="pl-9 h-9 w-full bg-muted/20 border-border focus-visible:ring-primary/20 text-sm"
        />
      </div>

      {/* Select Dropdowns & Reset */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
        {/* Role Select */}
        <Select value={roleValue} onValueChange={handleRoleChange}>
          <SelectTrigger className="h-9 w-[130px] border-border text-xs text-muted-foreground">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Select */}
        <Select value={statusValue} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-9 w-[130px] border-border text-xs text-muted-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {(filters.query || filters.globalRole || filters.isActive !== undefined) && (
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
