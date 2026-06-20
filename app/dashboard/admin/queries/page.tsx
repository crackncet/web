"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Inbox,
  Calendar,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  ArrowLeft,
  X,
  Reply,
  Check,
} from "lucide-react";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import { useAdminQueries, useRespondToQuery, UserQuery } from "@/hooks/use-queries";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AdminQueriesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"" | "PENDING" | "RESPONDED">("");
  
  // Search & Date states
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Selected query
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

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

  // Fetch admin queries
  const limit = 10;
  const {
    data,
    isLoading,
    isPlaceholderData,
  } = useAdminQueries({
    page,
    limit,
    status: statusFilter || undefined,
    query: debouncedSearch || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // Mutator for responding
  const { mutate: respondToQuery, isPending: isResponding } = useRespondToQuery();

  const queries = data?.queries || [];
  const pagination = data?.pagination || { totalPages: 1, total: 0 };
  const counts = data?.counts || { all: 0, pending: 0, responded: 0 };

  // Find selected query
  const selectedQuery = queries.find((q) => q.id === selectedQueryId);

  // Auto-select first query on desktop if none selected and queries are loaded
  useEffect(() => {
    if (queries.length > 0 && !selectedQueryId && !isMobile) {
      setSelectedQueryId(queries[0].id);
    }
  }, [queries, selectedQueryId, isMobile]);

  const handleRespondSubmit = () => {
    if (!selectedQueryId || !responseText.trim()) return;
    respondToQuery(
      { queryId: selectedQueryId, response: responseText.trim() },
      {
        onSuccess: () => {
          setResponseText("");
        },
      }
    );
  };

  const handleClearFilters = () => {
    setSearchVal("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isFiltersActive = searchVal || startDate || endDate;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header Portal Injection */}
      <AdminHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>ADMINISTRATION</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Support Inbox</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Support Inbox
          </h1>
        </div>
      </AdminHeader>

      {/* Gmail-style Two-pane grid view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start px-1">
        
        {/* Left Column: Filters and query thread items list */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Search and Date Filter Box */}
          <div className="bg-white dark:bg-slate-900/40 p-4 rounded-2xl shadow-xs space-y-3.5">
            {/* Search Input - Capsule style like Gmail/Google */}
            <div className="relative">
              <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, email, or message..."
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

            {/* Date Range & Clear Filters Row - Pills exactly like screenshot */}
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

          {/* Query list items card container */}
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
                    {/* Top Row: Name & Time */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs truncate ${
                        isPending ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-500"
                      }`}>
                        {query.student?.fullName || "Anonymous Student"}
                      </span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold shrink-0">
                        {formatDate(query.createdAt)}
                      </span>
                    </div>

                    {/* Subject line row */}
                    <div className="flex items-start gap-1.5 min-w-0">
                      <p className="text-xs truncate text-slate-650 dark:text-slate-450 font-medium flex-1">
                        <strong className="text-slate-700 dark:text-slate-350 font-bold mr-1">
                          {query.subject}:
                        </strong>
                        <span className="text-slate-400 dark:text-slate-500">{query.message}</span>
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

                    {/* Email preview snippet */}
                    <span className="text-[10px] text-slate-450 dark:text-slate-550 truncate">
                      {query.student?.email}
                    </span>
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

                {/* Message scroll body */}
                <div className="p-6 space-y-6">
                  {/* Student message block (Original email) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {selectedQuery.student?.profileImage ? (
                        <img
                          src={selectedQuery.student.profileImage}
                          alt={selectedQuery.student.fullName}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-black flex items-center justify-center shrink-0 text-sm">
                          {selectedQuery.student?.fullName ? selectedQuery.student.fullName[0].toUpperCase() : <User className="h-4.5 w-4.5" />}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {selectedQuery.student?.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            &lt;{selectedQuery.student?.email}&gt;
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">
                          Submitted: {formatDate(selectedQuery.createdAt)} at {formatTime(selectedQuery.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="pl-13 text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-w-2xl">
                      {selectedQuery.message}
                    </div>
                  </div>

                  {/* Response Thread */}
                  {selectedQuery.response && (
                    <div className="border-t border-slate-100 dark:border-slate-800/40 pt-6 mt-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center shrink-0">
                          <Reply className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Support Team Response
                          </span>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">
                            Responded: {selectedQuery.respondedAt ? `${formatDate(selectedQuery.respondedAt)} at ${formatTime(selectedQuery.respondedAt)}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="pl-13 text-xs leading-relaxed text-slate-700 dark:text-slate-350 whitespace-pre-wrap max-w-2xl">
                        {selectedQuery.response}
                      </div>
                    </div>
                  )}
                </div>

                {/* Response Editor (Footer of detail pane) */}
                {!selectedQuery.response && (
                  <div className="p-4 bg-white dark:bg-slate-900/35 border-t border-slate-100 dark:border-slate-850 shrink-0">
                    <div className="flex gap-3 items-start pl-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0 mt-1">
                        <Reply className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 flex flex-col gap-2.5">
                        <div className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                          Compose reply to student
                        </div>
                        <Textarea
                          placeholder={`Reply to ${selectedQuery.student?.fullName || "student"}...`}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          disabled={isResponding}
                          className="min-h-[100px] text-xs resize-y rounded-xl border-slate-200/80 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-primary bg-slate-50/40 dark:bg-slate-850"
                        />
                        <Button
                          size="sm"
                          onClick={handleRespondSubmit}
                          disabled={isResponding || !responseText.trim()}
                          className="self-end rounded-xl text-xs font-bold flex items-center gap-2 px-4 shadow-sm"
                        >
                          {isResponding ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-slate-450">
                <Inbox className="h-16 w-16 mb-3 text-slate-300 dark:text-slate-700 opacity-60" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Select a query</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-normal">
                  Choose a support thread from the list on the left to read and respond to the student.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MOBILE SHEET: Slide-up details on smaller screens */}
      <Sheet open={!!selectedQueryId && isMobile} onOpenChange={(open) => !open && setSelectedQueryId(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 p-0 overflow-hidden flex flex-col">
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
                {/* Sender details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedQuery.student?.profileImage ? (
                      <img
                        src={selectedQuery.student.profileImage}
                        alt={selectedQuery.student.fullName}
                        className="h-9 w-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-black flex items-center justify-center shrink-0 text-xs">
                        {selectedQuery.student?.fullName ? selectedQuery.student.fullName[0].toUpperCase() : <User className="h-4 w-4" />}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {selectedQuery.student?.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                          &lt;{selectedQuery.student?.email}&gt;
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold">
                        {formatDate(selectedQuery.createdAt)} at {formatTime(selectedQuery.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 whitespace-pre-wrap pl-1">
                    {selectedQuery.message}
                  </div>
                </div>

                {/* Response Thread */}
                {selectedQuery.response && (
                  <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center shrink-0">
                        <Reply className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          Support Team Response
                        </span>
                        <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold">
                          {selectedQuery.respondedAt ? `${formatDate(selectedQuery.respondedAt)} at ${formatTime(selectedQuery.respondedAt)}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 whitespace-pre-wrap pl-1">
                      {selectedQuery.response}
                    </div>
                  </div>
                )}
              </div>

              {/* Response Editor (Mobile footer) */}
              {!selectedQuery.response && (
                <div className="p-4 bg-white dark:bg-slate-900/35 border-t border-slate-100 dark:border-slate-850 mt-auto sticky bottom-0">
                  <div className="flex flex-col gap-2.5">
                    <div className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                      Compose reply to student
                    </div>
                    <Textarea
                      placeholder={`Reply to ${selectedQuery.student?.fullName || "student"}...`}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      disabled={isResponding}
                      className="min-h-[80px] text-xs resize-y rounded-xl border-slate-200/80 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-primary bg-slate-50/40 dark:bg-slate-850"
                    />
                    <Button
                      size="sm"
                      onClick={handleRespondSubmit}
                      disabled={isResponding || !responseText.trim()}
                      className="self-end rounded-xl text-xs font-bold flex items-center gap-2 px-4 shadow-sm"
                    >
                      {isResponding ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Send Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
