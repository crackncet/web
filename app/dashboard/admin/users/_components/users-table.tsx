"use client";

import React, { useState } from "react";
import { User } from "../_api/users.api";
import { useToggleUserStatusMutation } from "../_queries/users.queries";
import { ShieldAlert, Loader2, Sparkles, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
}

export function UsersTable({ users, isLoading }: UsersTableProps) {
  const { mutate: toggleStatus, isPending } = useToggleUserStatusMutation();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = (userId: string, role: string) => {
    if (role === "ADMIN") return;
    setTogglingId(userId);
    toggleStatus(userId, {
      onSettled: () => setTogglingId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-2 text-sm font-medium">
          Loading user database...
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center">
        <ShieldAlert className="h-10 w-10 text-muted-foreground/60 mb-2" />
        <h3 className="font-medium text-foreground text-base">
          No users found
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1 font-normal">
          We couldn't find any users matching the selected filters. Try broadening your query.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-medium uppercase tracking-wider select-none">
            <th className="px-6 py-4">User Details</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Contact</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-foreground/80 text-sm">
          {users.map((user) => {
            const isUserToggling = togglingId === user.id && isPending;
            return (
              <tr
                key={user.id}
                className="hover:bg-muted/10 transition-colors duration-150"
              >
                {/* Profile & Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.fullName}
                        className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-medium flex items-center justify-center shrink-0">
                        {user.fullName[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground truncate">
                        {user.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate mt-0.5 font-normal">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Role Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.globalRole === "ADMIN" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                      ADMIN
                    </span>
                  ) : user.globalRole === "TEAM_MEMBER" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      TEAM
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                      STUDENT
                    </span>
                  )}
                </td>

                {/* Contact Info */}
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-normal">
                  {user.phone || "—"}
                </td>

                {/* Active Status Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {user.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Ban className="h-3 w-3" />
                        <span>Suspended</span>
                      </>
                    )}
                  </span>
                </td>

                {/* Actions Toggle */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {user.globalRole === "ADMIN" ? (
                    <span className="text-xs text-muted-foreground/60 italic px-2 font-normal">
                      System Admin
                    </span>
                  ) : (
                    <Button
                      variant={user.isActive ? "destructive" : "default"}
                      size="sm"
                      disabled={isUserToggling}
                      onClick={() => handleToggle(user.id, user.globalRole)}
                      className="cursor-pointer min-w-[90px] h-8 rounded-lg text-xs font-medium"
                    >
                      {isUserToggling ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : user.isActive ? (
                        "Suspend"
                      ) : (
                        "Activate"
                      )}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
