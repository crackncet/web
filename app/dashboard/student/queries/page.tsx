"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  MessageSquare,
  Sparkles,
  Plus,
  Loader2,
  Calendar,
  CornerDownRight,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Inbox,
  Check,
} from "lucide-react";
import { StudentHeader } from "../layout";
import { useStudentQueries, useSubmitQuery } from "@/hooks/use-queries";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const queryFormSchema = z.object({
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(255, "Subject cannot exceed 255 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type QueryFormValues = z.infer<typeof queryFormSchema>;

export default function StudentQueriesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"" | "PENDING" | "RESPONDED">("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Search & Date filters
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Selected query for Two-Pane View
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Handle screen resize to switch layout styles
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch queries
  const limit = 10;
  const {
    data,
    isLoading,
    isPlaceholderData,
  } = useStudentQueries({
    page,
    limit,
    status: statusFilter || undefined,
    query: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // Submit query mutation
  const { mutate: submitQuery, isPending: isSubmitting } = useSubmitQuery();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QueryFormValues>({
    resolver: zodResolver(queryFormSchema as any),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: QueryFormValues) => {
    submitQuery(values, {
      onSuccess: () => {
        toast.success("Query submitted successfully!");
        setDialogOpen(false);
        reset();
        setPage(1); // Reset to first page to see the new query
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to submit query. Please try again.");
      },
    });
  };

  const queries = data?.queries || [];
  const pagination = data?.pagination || { totalPages: 1, total: 0 };
  const counts = data?.counts || { all: 0, pending: 0, responded: 0 };

  // Find currently selected query details
  const selectedQuery = queries.find((q) => q.id === selectedQueryId);

  // Auto-select first query on desktop if none selected and queries are loaded
  useEffect(() => {
    if (queries.length > 0 && !selectedQueryId && !isMobile) {
      setSelectedQueryId(queries[0].id);
    }
  }, [queries, selectedQueryId, isMobile]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClearFilters = () => {
    setSearchVal("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const isFiltersActive = searchVal || startDate || endDate;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      <StudentHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-violet-500" />
          <span className="font-extrabold text-slate-850 dark:text-white">My Queries & Support</span>
        </div>
      </StudentHeader>

      {/* Action Header - Clean, borderless and compact */}
      <div className="flex items-center justify-between gap-4 shrink-0 px-1">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Queries & Responses
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Submit your doubts or complaints directly to our administrators.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold flex items-center gap-1.5 rounded-xl shadow-xs cursor-pointer text-xs px-3 py-1.5">
              <Plus className="h-3.5 w-3.5" />
              New Query
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Submit a Support Query
              </DialogTitle>
              <DialogDescription className="text-xs">
                Describe your query in detail. Our administrators will review and respond as soon as possible.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FieldGroup className="space-y-3">
                <Field>
                  <FieldLabel htmlFor="subject" className="text-xs">Subject</FieldLabel>
                  <Input
                    id="subject"
                    placeholder="E.g., Payment failed but money deducted"
                    className="text-xs rounded-xl"
                    {...register("subject")}
                    disabled={isSubmitting}
                  />
                  {errors.subject && <FieldError className="text-[10px]">{errors.subject.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="message" className="text-xs">Message</FieldLabel>
                  <Textarea
                    id="message"
                    placeholder="Explain your query in detail..."
                    className="min-h-[120px] resize-y text-xs rounded-xl"
                    {...register("message")}
                    disabled={isSubmitting}
                  />
                  {errors.message && <FieldError className="text-[10px]">{errors.message.message}</FieldError>}
                </Field>
              </FieldGroup>

              <div className="flex justify-end gap-2.5 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl font-semibold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl font-semibold flex items-center gap-2 text-xs"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Query
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gmail-style Two-pane grid view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start px-1">
        
        {/* Left Column: Filters and query thread items list */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Search and Date Filter Box */}
          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-2xl shadow-xs space-y-3.5">
            {/* Search Input - Capsule style */}
            <div className="relative">
              <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by subject or query body..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-slate-50 dark:bg-slate-850/50 border-0 focus:ring-1 focus:ring-primary text-xs font-semibold placeholder-slate-400 text-slate-800 dark:text-slate-100 outline-none transition-all"
              />
              {searchVal && (
                <button
                  onClick={() => setSearchVal("")}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Date Range & Clear Filters Row - Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850/50 rounded-full px-3 py-1.5 border border-slate-200/50 dark:border-slate-800/80 flex-1 min-w-[100px] justify-between">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent border-0 text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none w-full cursor-pointer focus:ring-0 focus:outline-none px-1"
                />
              </div>
              <span className="text-slate-400 text-xs font-bold px-0.5">to</span>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850/50 rounded-full px-3 py-1.5 border border-slate-200/50 dark:border-slate-800/80 flex-1 min-w-[100px] justify-between">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent border-0 text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none w-full cursor-pointer focus:ring-0 focus:outline-none px-1"
                />
              </div>

              {isFiltersActive && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 text-xs font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-full cursor-pointer transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Tabs matching the custom count wireframe design */}
            <div className="flex gap-2 items-center overflow-x-auto pt-1 no-scrollbar">
              {(["", "PENDING", "RESPONDED"] as const).map((status) => {
                const isSelected = statusFilter === status;
                const count = status === "" 
                  ? counts.all 
                  : status === "PENDING" 
                  ? counts.pending 
                  : counts.responded;
                const label = status === "" ? "All" : status === "PENDING" ? "Pending" : "Responded";

                return (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setPage(1);
                    }}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? "border-slate-800 dark:border-slate-200 bg-slate-50/50 dark:bg-slate-850 text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500"
                    }`}
                  >
                    <span>{label}</span>
                    <span className={isSelected ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-400 font-bold"}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Query list items card container */}
          <div className="bg-white dark:bg-slate-900/40 rounded-2xl shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/40">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-1/6 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-slate-150 dark:bg-slate-800/60 rounded" />
                  <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800/40 rounded" />
                </div>
              ))
            ) : queries.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Inbox className="h-10 w-10 mb-2 opacity-55" />
                <span className="text-xs font-bold">No queries found</span>
                <span className="text-[10px] text-slate-400/80 mt-0.5">Try altering filters or search input</span>
              </div>
            ) : (
              queries.map((query) => {
                const isSelected = query.id === selectedQueryId;
                const isPending = query.status === "PENDING";
                
                return (
                  <div
                    key={query.id}
                    onClick={() => setSelectedQueryId(query.id)}
                    className={`p-4 flex flex-col gap-1 cursor-pointer transition-colors relative ${
                      isSelected
                        ? "bg-primary/5 dark:bg-primary/10"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/30 bg-transparent"
                    }`}
                  >
                    {/* Top Row: Subject & Time */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs truncate ${
                        isPending ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-500"
                      }`}>
                        {query.subject}
                      </span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold shrink-0">
                        {formatDate(query.createdAt)}
                      </span>
                    </div>

                    {/* Snippet Preview */}
                    <div className="flex items-start gap-1.5 min-w-0">
                      <p className="text-xs truncate text-slate-400 dark:text-slate-550 font-medium flex-1 leading-normal">
                        {query.message}
                      </p>

                      {/* Status indicator icon */}
                      {isPending ? (
                        <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5" title="Pending Reply" />
                      ) : (
                        <span title="Responded">
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Left Pane Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="p-3 bg-white dark:bg-slate-900/40 rounded-2xl shadow-xs flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold px-1">
                Page {page} of {pagination.totalPages}
              </span>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isPlaceholderData}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages || isPlaceholderData}
                  className="h-7 w-7 p-0 rounded-lg"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Message Detail Pane (Desktop only) */}
        <div className="hidden lg:col-span-7 lg:block lg:sticky lg:top-[80px] self-start">
          <div className="bg-white dark:bg-slate-900/40 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[450px]">
            {selectedQuery ? (
              <div className="flex flex-col w-full">
                {/* Detail Pane Header Toolbar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between gap-4 bg-white dark:bg-slate-900/20 shrink-0">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-md">
                    {selectedQuery.subject}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      selectedQuery.status === "PENDING"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    }`}
                  >
                    {selectedQuery.status}
                  </span>
                </div>

                {/* Message body */}
                <div className="p-6 space-y-6">
                  {/* Original Query Message */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        My Query Message
                      </span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">
                        Submitted: {formatDate(selectedQuery.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 whitespace-pre-wrap max-w-2xl">
                      {selectedQuery.message}
                    </div>
                  </div>

                  {/* Admin Response Thread */}
                  {selectedQuery.response ? (
                    <div className="border-t border-slate-100 dark:border-slate-800/40 pt-6 mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider">
                          <CornerDownRight className="h-3.5 w-3.5" />
                          <span>Response from Admin</span>
                        </div>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">
                          Responded: {selectedQuery.respondedAt ? formatDate(selectedQuery.respondedAt) : ""}
                        </span>
                      </div>
                      <div className="pl-5 text-xs leading-relaxed text-slate-755 dark:text-slate-300 whitespace-pre-wrap max-w-2xl">
                        {selectedQuery.response}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-slate-100 dark:border-slate-800/40 pt-6 mt-6 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 italic">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                      <span>Awaiting response from administrator...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-slate-450">
                <Inbox className="h-16 w-16 mb-3 text-slate-300 dark:text-slate-700 opacity-60" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Select a query</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-normal">
                  Choose a support query from the list on the left to read responses and support history.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MOBILE SHEET: Slide-up details on smaller screens */}
      <Sheet open={!!selectedQueryId && isMobile} onOpenChange={(open) => !open && setSelectedQueryId(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-955 p-0 overflow-hidden flex flex-col">
          {selectedQuery && (
            <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
              <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between gap-4 bg-white dark:bg-slate-900/20 sticky top-0 z-10 shrink-0">
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-xs">
                  {selectedQuery.subject}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    selectedQuery.status === "PENDING"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  }`}
                >
                  {selectedQuery.status}
                </span>
              </div>

              <div className="p-4 space-y-6">
                {/* Original Query Message */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-455 uppercase tracking-wider">
                      My Query Message
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">
                      {formatDate(selectedQuery.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 whitespace-pre-wrap pl-1">
                    {selectedQuery.message}
                  </div>
                </div>

                {/* Admin Response Thread */}
                {selectedQuery.response ? (
                  <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-wider">
                        <CornerDownRight className="h-4 w-4" />
                        <span>Response from Admin</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold">
                        {selectedQuery.respondedAt ? formatDate(selectedQuery.respondedAt) : ""}
                      </span>
                    </div>
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 whitespace-pre-wrap pl-5">
                      {selectedQuery.response}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-4 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 italic">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                    <span>Awaiting response from administrator...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
