"use client";

import React from "react";
import { TeachingStaff } from "@/app/dashboard/admin/teachers/_api/teachers.api";
import { ShieldAlert, Loader2, BookOpen, GraduationCap, School } from "lucide-react";

interface TeachersTableProps {
  staffList: TeachingStaff[];
  isLoading: boolean;
}

export function TeachersTable({ staffList, isLoading }: TeachersTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-2 text-sm font-medium">
          Loading teaching staff database...
        </p>
      </div>
    );
  }

  if (staffList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center animate-in fade-in duration-200">
        <ShieldAlert className="h-10 w-10 text-muted-foreground/60 mb-2" />
        <h3 className="font-medium text-foreground text-base">
          No teaching staff found
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1 font-normal">
          We couldn't find any teaching assignments matching the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-medium uppercase tracking-wider select-none">
            <th className="px-6 py-4">Staff Details</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Stream & Subject</th>
            <th className="px-6 py-4">College</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-foreground/80 text-sm">
          {staffList.map((staff) => {
            const initial = staff.user.fullName[0]?.toUpperCase() || "T";
            const role = staff.role;

            return (
              <tr
                key={staff.id}
                className="hover:bg-muted/10 transition-colors duration-150"
              >
                {/* Profile & Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {staff.user.profileImage ? (
                      <img
                        src={staff.user.profileImage}
                        alt={staff.user.fullName}
                        className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center shrink-0">
                        {initial}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground truncate">
                        {staff.user.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate mt-0.5 font-normal">
                        {staff.user.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Role Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {role === "TEACHER" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      Teacher
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Teaching Asst.
                    </span>
                  )}
                </td>

                {/* Stream & Subject */}
                <td className="px-6 py-4">
                  <div className="flex flex-col min-w-0 gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium text-foreground/90">{staff.stream.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
                        <BookOpen className="h-3 w-3 shrink-0" />
                        <span>{staff.subject.name}</span>
                      </div>
                      <span className="inline-flex text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border font-medium">
                        {staff.subject.type}
                      </span>
                    </div>
                  </div>
                </td>

                {/* College Info */}
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-normal">
                  <div className="flex items-center gap-1.5">
                    <School className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                    <span className="truncate max-w-[200px]">{staff.collegeName}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
