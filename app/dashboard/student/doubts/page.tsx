"use client";

import React, { useState } from "react";
import {
  useStudentDoubtsQuery,
  useStudentEligibleSubjectsQuery,
  useCreateDoubtMutation,
} from "./_queries/doubts.queries";
import { GetStudentDoubtsFilters } from "./_api/doubts.api";
import { StudentDoubtCard } from "./_components/student-doubt-card";
import { AskDoubtDrawer } from "./_components/ask-doubt-drawer";
import { DoubtFilters } from "./_components/doubt-filters";
import { Plus, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentHeader } from "../layout";

export default function StudentDoubtsPage() {
  const [filters, setFilters] = useState<GetStudentDoubtsFilters>({
    page: 1,
    limit: 10,
    status: undefined,
    subjectId: undefined,
  });

  const { data: doubtsData, isLoading: isLoadingDoubts } = useStudentDoubtsQuery(filters);
  const { data: eligibleSubjects = [] } = useStudentEligibleSubjectsQuery();
  const createDoubtMutation = useCreateDoubtMutation();

  const [isOpen, setIsOpen] = useState(false);

  const handleCreateDoubt = (data: {
    type: "ACADEMIC" | "NON_ACADEMIC";
    subjectId?: string;
    title: string;
    description: string;
    imageUrl: string | null;
  }) => {
    createDoubtMutation.mutate(data, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* StudentHeader for Top Bar portal injection */}
      <StudentHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-bold text-foreground md:text-xl">Doubt Desk</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Submit and track your doubts with our academic and support staff
            </p>
          </div>

          <Button
            onClick={() => setIsOpen(true)}
            className="cursor-pointer gap-1.5 font-bold shadow-xs hover:shadow-sm rounded-xl text-xs px-4"
          >
            <Plus className="h-4 w-4" />
            <span>Ask Doubt</span>
          </Button>
        </div>
      </StudentHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <DoubtFilters
            filters={filters}
            onChangeFilters={setFilters}
            eligibleSubjects={eligibleSubjects}
          />
        </div>

        {/* Doubts Queue */}
        <div className="lg:col-span-3 space-y-4">
          {isLoadingDoubts ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-xs font-semibold mt-2">
                Retrieving doubts...
              </p>
            </div>
          ) : !doubtsData || doubtsData.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 select-none">
              <HelpCircle className="h-10 w-10 text-slate-350 dark:text-slate-650 mb-2" />
              <h3 className="font-bold text-foreground text-sm">No doubts recorded</h3>
              <p className="text-muted-foreground text-xs max-w-sm mt-1">
                You haven't submitted any doubts under these filters yet. Click "Ask Doubt" to post one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {doubtsData.data.map((doubt) => (
                <StudentDoubtCard key={doubt.id} doubt={doubt} />
              ))}

              {/* Pagination */}
              {doubtsData.meta?.pagination && doubtsData.meta.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs select-none">
                  <span className="text-muted-foreground font-medium">
                    Showing page {doubtsData.meta.pagination.page} of {doubtsData.meta.pagination.totalPages}
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
                      disabled={filters.page >= doubtsData.meta.pagination.totalPages}
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

      <AskDoubtDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        eligibleSubjects={eligibleSubjects}
        onSubmit={handleCreateDoubt}
        isPending={createDoubtMutation.isPending}
      />
    </div>
  );
}
