"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MemberHeader } from "../layout";
import {
  useMySubjectsQuery,
  useMyNotesQuery,
  useMyVideosQuery,
  useDeleteMediaAssetMutation,
} from "./_queries/media.queries";
import { UploadNoteDialog } from "./_components/upload-note-dialog";
import { UploadVideoDialog } from "./_components/upload-video-dialog";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Video,
  Play,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

// Helper to format file sizes
function formatBytes(bytes?: number | null) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper to format video duration
function formatDuration(secs?: number | null) {
  if (!secs) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<"notes" | "videos">("notes");
  const [page, setPage] = useState(1);
  const limit = 10; // Table rows limit

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const deleteAssetMutation = useDeleteMediaAssetMutation();

  // Reset page when switching tabs
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch subjects for filter dropdown
  const { data: subjectsData } = useMySubjectsQuery();
  const subjects = subjectsData?.data || [];

  // Fetch notes
  const { data: notesData, isLoading: isNotesLoading } = useMyNotesQuery({
    page,
    limit,
    search: debouncedQuery,
    subjectId: selectedSubjectId === "ALL" ? "" : selectedSubjectId,
  });

  // Fetch videos
  const { data: videosData, isLoading: isVideosLoading } = useMyVideosQuery({
    page,
    limit,
    search: debouncedQuery,
    subjectId: selectedSubjectId === "ALL" ? "" : selectedSubjectId,
  });

  const notes = notesData?.data || [];
  const videos = videosData?.data || [];

  const notesMeta = notesData?.meta || { page: 1, limit: 10, total: 0, totalPages: 0 };
  const videosMeta = videosData?.meta || { page: 1, limit: 10, total: 0, totalPages: 0 };

  const currentMeta = activeTab === "notes" ? notesMeta : videosMeta;
  const isLoading = activeTab === "notes" ? isNotesLoading : isVideosLoading;

  // Pagination bounds calculation
  const startEntry = currentMeta.total === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, currentMeta.total);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedQuery("");
    setSelectedSubjectId("");
    setPage(1);
  };

  const handleSubjectChange = (val: string) => {
    setSelectedSubjectId(val === "ALL" ? "" : val);
    setPage(1);
  };

  const handleDeleteAsset = async (id: string, assetName: string) => {
    if (confirm(`Are you sure you want to delete "${assetName}"?`)) {
      try {
        await deleteAssetMutation.mutateAsync(id);
        toast.success("Asset deleted successfully");
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete asset");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <MemberHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>LIBRARY</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">{activeTab === "notes" ? "Notes" : "Videos"}</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 select-none mt-0.5">
            {activeTab === "notes" ? "Notes Library" : "Video Lectures"}
          </h1>
        </div>
        {activeTab === "notes" ? (
          <UploadNoteDialog subjects={subjects} />
        ) : (
          <UploadVideoDialog subjects={subjects} />
        )}
      </MemberHeader>

      {/* Tabs Selector & Filter Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Modern Segmented Control */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 select-none">
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === "notes"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            Study Notes
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === "videos"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="h-4 w-4" />
            Video Lectures
          </button>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <div className="flex flex-1 items-center gap-3 w-full sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={activeTab === "notes" ? "Search by document title..." : "Search by video title..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs rounded-lg"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleResetFilters}
              disabled={!searchTerm && !selectedSubjectId}
              className="h-10 w-10 shrink-0 border-slate-200 dark:border-slate-800 hover:bg-muted/10 rounded-lg cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <Select value={selectedSubjectId || "ALL"} onValueChange={handleSubjectChange}>
              <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm h-10 px-3 shadow-2xs rounded-lg">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Subjects</SelectItem>
                {subjects.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* List / Skeletons / Empty State */}
      {isLoading ? (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-0">
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <div className="flex items-center gap-3 w-1/3">
                    <Skeleton className="h-9 w-9 rounded-lg bg-muted/60" />
                    <Skeleton className="h-4 w-full bg-muted/60" />
                  </div>
                  <Skeleton className="h-4 w-1/6 bg-muted/60" />
                  <Skeleton className="h-4 w-1/12 bg-muted/60" />
                  <Skeleton className="h-8 w-20 bg-muted/60" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (activeTab === "notes" ? notes.length === 0 : videos.length === 0) ? (
        <Card className="border border-dashed border-border/80 bg-muted/5 py-12 flex flex-col items-center justify-center text-center p-6 select-none rounded-xl">
          <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/80">
            {activeTab === "notes" ? <FileText className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </div>
          <h3 className="font-bold text-sm text-foreground">
            {activeTab === "notes" ? "No Notes Found" : "No Videos Found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
            {activeTab === "notes"
              ? "You have not uploaded any study notes assets, or none match the filters."
              : "You have not uploaded any video lectures, or none match the filters."}
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-4 text-xs font-semibold cursor-pointer">
            Clear Filters
          </Button>
        </Card>
      ) : activeTab === "notes" ? (
        // NOTES VIEW
        <div className="space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="w-[40%] text-xs font-bold text-slate-500 dark:text-slate-400">File Name</TableHead>
                  <TableHead className="w-[20%] text-xs font-bold text-slate-500 dark:text-slate-400">Subject</TableHead>
                  <TableHead className="w-[15%] text-xs font-bold text-slate-500 dark:text-slate-400">Size</TableHead>
                  <TableHead className="w-[13%] text-xs font-bold text-slate-500 dark:text-slate-400">Uploaded</TableHead>
                  <TableHead className="w-[12%] text-right text-xs font-bold text-slate-500 dark:text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <TableCell className="text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="truncate max-w-[280px] text-xs font-normal">{note.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md text-[10px] font-normal">
                        {note.subjectName || "Unknown Subject"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(note.sizeBytes)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(note.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer" asChild>
                          <Link href={`/dashboard/member/media/${note.id}/view`} title="View note">
                            <Play className="h-4 w-4 text-slate-500 hover:text-primary fill-none" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAsset(note.id, note.name)}
                          className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-500 cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {currentMeta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl select-none shadow-xs">
              <span className="text-xs text-muted-foreground font-normal">
                Showing <span className="font-semibold text-foreground">{startEntry}</span> to{" "}
                <span className="font-semibold text-foreground">{endEntry}</span> of{" "}
                <span className="font-semibold text-foreground">{currentMeta.total}</span> notes
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="h-8 text-xs font-bold gap-1 cursor-pointer border-border hover:bg-muted/10 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <div className="flex items-center justify-center px-3 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[2.25rem]">
                  {page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, currentMeta.totalPages))}
                  disabled={page === currentMeta.totalPages}
                  className="h-8 text-xs font-bold gap-1 cursor-pointer border-border hover:bg-muted/10 rounded-lg"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // VIDEOS VIEW
        <div className="space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="w-[38%] text-xs font-bold text-slate-500 dark:text-slate-400">Video Lecture</TableHead>
                  <TableHead className="w-[18%] text-xs font-bold text-slate-500 dark:text-slate-400">Subject</TableHead>
                  <TableHead className="w-[12%] text-xs font-bold text-slate-500 dark:text-slate-400">Size</TableHead>
                  <TableHead className="w-[10%] text-xs font-bold text-slate-500 dark:text-slate-400">Status</TableHead>
                  <TableHead className="w-[10%] text-xs font-bold text-slate-500 dark:text-slate-400">Uploaded</TableHead>
                  <TableHead className="w-[12%] text-right text-xs font-bold text-slate-500 dark:text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((vid) => (
                  <TableRow key={vid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <TableCell className="text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-3">
                        {/* Video Thumbnail Wrapper */}
                        <div className="relative h-10 w-16 bg-black rounded-md overflow-hidden border border-slate-250 dark:border-slate-850 shrink-0">
                          {vid.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={vid.thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950">
                              <Video className="h-4 w-4" />
                            </div>
                          )}
                          <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-white font-mono text-[8px] font-bold px-1 rounded-sm leading-tight select-none">
                            {formatDuration(vid.durationSeconds)}
                          </span>
                        </div>
                        <span className="truncate max-w-[200px] text-xs font-normal" title={vid.name}>
                          {vid.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md text-[10px] font-normal">
                        {vid.subjectName || "Unknown Subject"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {formatBytes(vid.sizeBytes)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {vid.status === "READY" && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          Ready
                        </span>
                      )}
                      {(vid.status === "PROCESSING" || vid.status === "UPLOADING") && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                          Transcoding
                        </span>
                      )}
                      {vid.status === "FAILED" && (
                        <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-md text-[10px] font-bold" title="Transcoding failed. Source deleted.">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          Failed
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(vid.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer"
                          disabled={vid.status !== "READY"}
                          asChild={vid.status === "READY"}
                        >
                          {vid.status === "READY" ? (
                            <Link href={`/dashboard/member/media/${vid.id}/view`} title="Play lecture">
                              <Play className="h-4 w-4 text-slate-500 hover:text-primary fill-none" />
                            </Link>
                          ) : (
                            <Play className="h-4 w-4 text-slate-300 dark:text-slate-700 cursor-not-allowed" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAsset(vid.id, vid.name)}
                          className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-500 cursor-pointer"
                          title="Delete video"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {currentMeta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl select-none shadow-xs">
              <span className="text-xs text-muted-foreground font-normal">
                Showing <span className="font-semibold text-foreground">{startEntry}</span> to{" "}
                <span className="font-semibold text-foreground">{endEntry}</span> of{" "}
                <span className="font-semibold text-foreground">{currentMeta.total}</span> videos
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="h-8 text-xs font-bold gap-1 cursor-pointer border-border hover:bg-muted/10 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <div className="flex items-center justify-center px-3 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[2.25rem]">
                  {page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, currentMeta.totalPages))}
                  disabled={page === currentMeta.totalPages}
                  className="h-8 text-xs font-bold gap-1 cursor-pointer border-border hover:bg-muted/10 rounded-lg"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
