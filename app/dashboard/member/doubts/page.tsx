"use client";

import React, { useState } from "react";
import { MemberHeader } from "../layout";
import { useTeacherQueueQuery, useClaimDoubtMutation } from "./_queries/doubts.queries";
import { GetTeacherQueueFilters } from "./_api/doubts.api";
import { MemberDoubtCard } from "./_components/member-doubt-card";
import { Filter, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MemberDoubtsQueuePage() {
  const [filters, setFilters] = useState<GetTeacherQueueFilters>({
    page: 1,
    limit: 10,
    status: undefined,
    subjectId: undefined,
  });

  const { data: queueData, isLoading } = useTeacherQueueQuery(filters);
  const claimMutation = useClaimDoubtMutation();

  const handleClaim = (doubtId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    claimMutation.mutate(doubtId);
  };

  const startEntry = queueData?.meta?.pagination
    ? (filters.page - 1) * filters.limit + 1
    : 0;
  const endEntry = queueData?.meta?.pagination
    ? Math.min(filters.page * filters.limit, queueData.meta.pagination.total)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <MemberHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>WORKSPACE</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Doubt Queue</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Doubt Queue
          </h1>
        </div>
      </MemberHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start select-none">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 border border-border bg-card rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider pb-3 border-b border-border">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>

          {/* Status filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Resolution State
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value ? (e.target.value as any) : undefined,
                  page: 1,
                }))
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none"
            >
              <option value="">All Unresolved Doubts</option>
              <option value="UNASSIGNED">Unassigned Doubts (Open Pool)</option>
              <option value="CLAIMED">Claimed by Me (In-Progress)</option>
            </select>
          </div>
        </div>

        {/* Queue List */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-border bg-card rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-xs font-semibold mt-2">
                Retrieving queue...
              </p>
            </div>
          ) : !queueData || queueData.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center border border-border rounded-xl bg-card p-6">
              <HelpCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <h3 className="font-semibold text-foreground text-sm">No doubts in queue</h3>
              <p className="text-muted-foreground text-xs max-w-sm mt-1">
                There are no open or claimed doubts matching your subjects at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueData.data.map((doubt) => (
                <MemberDoubtCard
                  key={doubt.id}
                  doubt={doubt}
                  onClaim={handleClaim}
                  isClaimPending={claimMutation.isPending}
                />
              ))}

              {/* Pagination */}
              {queueData.meta?.pagination && queueData.meta.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border border-border bg-card rounded-xl text-xs">
                  <span className="text-muted-foreground">
                    Showing {startEntry} to {endEntry} of {queueData.meta.pagination.total} entries
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className="rounded-lg h-8 cursor-pointer"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page >= queueData.meta.pagination.totalPages}
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="rounded-lg h-8 cursor-pointer"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
