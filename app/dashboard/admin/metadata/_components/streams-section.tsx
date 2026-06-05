"use client";

import React, { useState, useEffect } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Trash2,
  ShieldAlert,
  Loader2,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  streamQueryKeys,
  useStreamDetailsQuery,
  useStreamSubjectsQuery,
  useHodCandidatesQuery,
} from "../_queries/streams.queries";
import {
  getStreams,
  createStream,
  deleteStream,
  updateStream,
  createSubject,
  activateSubject,
  deleteSubject,
} from "../_api/streams.api";
import { toast } from "sonner";

function StreamDetailsSheet({
  streamId,
  onClose,
  isMobile,
}: {
  streamId: string | null;
  onClose: () => void;
  isMobile: boolean;
}) {
  const queryClient = useQueryClient();
  const { data: stream, isLoading: isDetailsLoading, error: detailsError } = useStreamDetailsQuery(streamId);
  const { data: subjects, isLoading: isSubjectsLoading } = useStreamSubjectsQuery(streamId);
  const { data: hodCandidatesData } = useHodCandidatesQuery();

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectType, setNewSubjectType] = useState<"DOMAIN" | "NON_DOMAIN" | "LANGUAGE">("DOMAIN");
  const [selectedHodId, setSelectedHodId] = useState<string | null>(null);

  useEffect(() => {
    if (stream) {
      setSelectedHodId(stream.hod?.email ? null : null); // reset HOD selection state on change
    }
  }, [stream]);

  // Update Stream (Assign HOD) mutation
  const { mutate: updateStreamMutate, isPending: isUpdatingStream } = useMutation({
    mutationFn: (data: { hodId: string | null }) => updateStream(streamId!, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: streamQueryKeys.detail(streamId!) });
      queryClient.invalidateQueries({ queryKey: streamQueryKeys.all });
      toast.success(res.message || "HOD updated successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update HOD");
    },
  });

  // Create Subject mutation
  const { mutate: createSubjectMutate, isPending: isCreatingSubject } = useMutation({
    mutationFn: (data: { name: string; type: "DOMAIN" | "NON_DOMAIN" | "LANGUAGE" }) =>
      createSubject(streamId!, data.name, data.type),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: streamQueryKeys.subjects(streamId!) });
      toast.success(res.message || "Subject created successfully");
      setNewSubjectName("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create subject");
    },
  });

  // Toggle Subject Status mutation
  const { mutate: toggleSubjectMutate } = useMutation({
    mutationFn: (subject: { id: string; isActive: boolean }) => {
      if (subject.isActive) {
        return deleteSubject(subject.id);
      } else {
        return activateSubject(subject.id);
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: streamQueryKeys.subjects(streamId!) });
      toast.success(res.message || "Subject status updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update subject status");
    },
  });

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      toast.error("Subject name cannot be empty");
      return;
    }
    createSubjectMutate({ name: newSubjectName.trim(), type: newSubjectType });
  };

  const handleAssignHod = (value: string) => {
    const hodId = value === "NONE" ? null : value;
    updateStreamMutate({ hodId });
  };

  const candidates = hodCandidatesData || [];

  return (
    <Sheet open={!!streamId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="max-h-[85vh] md:max-h-full sm:h-full w-full md:max-w-xl rounded-t-xl md:rounded-t-none border-t sm:border-t-0 sm:border-l p-6 flex flex-col gap-0"
      >
        <SheetHeader className="p-0 border-b border-border pb-4 flex-shrink-0">
          <SheetTitle className="text-lg font-semibold text-foreground">
            Stream Information
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground font-normal">
            Detailed configurations and associated subjects list.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isDetailsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Fetching stream details...
              </p>
            </div>
          ) : detailsError || !stream ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShieldAlert className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm font-medium text-foreground">
                Failed to load stream details
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-normal">
                {detailsError instanceof Error ? detailsError.message : "Stream not found."}
              </p>
            </div>
          ) : (
            <div className="space-y-6 py-6">
              {/* Stream Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Stream Name
                  </label>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {stream.name}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Stream ID
                  </label>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5 break-all select-all bg-muted/40 p-1 rounded border border-border/40">
                    {stream.id}
                  </p>
                </div>
              </div>

              {/* HOD Assignment */}
              <div className="border-t border-border pt-4">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Head of Department (HOD)
                </label>

                {stream.hod ? (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-lg mb-3">
                    {stream.hod.profileImage ? (
                      <img
                        src={stream.hod.profileImage}
                        alt={stream.hod.fullName}
                        className="h-10 w-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {stream.hod.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {stream.hod.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic mb-3">
                    No Head of Department assigned to this stream.
                  </p>
                )}

                {/* HOD Select Form */}
                <div className="flex items-center gap-2 max-w-sm">
                  <Select
                    onValueChange={handleAssignHod}
                    disabled={isUpdatingStream}
                    defaultValue={stream.hod ? undefined : "NONE"}
                  >
                    <SelectTrigger className="h-9 text-xs bg-muted/10 border-border">
                      <SelectValue placeholder="Assign or Change HOD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">No HOD (Unassign)</SelectItem>
                      {candidates.map((cand) => (
                        <SelectItem key={cand.id} value={cand.id}>
                          {cand.fullName} ({cand.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isUpdatingStream && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              </div>

              {/* Subjects List in this Stream */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Associated Subjects
                  </label>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                    {subjects ? subjects.length : 0} total
                  </span>
                </div>

                {isSubjectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : !subjects || subjects.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border rounded-lg bg-muted/5">
                    <BookOpen className="h-7 w-7 text-muted-foreground/40 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-foreground">No subjects found</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Add the first subject below.
                    </p>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden bg-muted/5 max-h-[260px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow className="border-b border-border">
                          <TableHead className="text-[10px] font-semibold px-4 py-2">Name</TableHead>
                          <TableHead className="text-[10px] font-semibold px-4 py-2">Type</TableHead>
                          <TableHead className="text-[10px] font-semibold px-4 py-2 text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map((sub) => (
                          <TableRow key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/5">
                            <TableCell className="text-xs font-medium px-4 py-2.5">{sub.name}</TableCell>
                            <TableCell className="text-[10px] font-normal px-4 py-2.5 text-muted-foreground">
                              {sub.type}
                            </TableCell>
                            <TableCell className="px-4 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                    sub.isActive
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                      : "bg-muted text-muted-foreground border border-border"
                                  }`}
                                >
                                  {sub.isActive ? "Active" : "Inactive"}
                                </span>
                                <button
                                  onClick={() => toggleSubjectMutate({ id: sub.id, isActive: sub.isActive })}
                                  className="text-muted-foreground hover:text-foreground cursor-pointer animate-none"
                                  title={sub.isActive ? "Deactivate subject" : "Activate subject"}
                                >
                                  {sub.isActive ? (
                                    <ToggleRight className="h-5 w-5 text-emerald-500" />
                                  ) : (
                                    <ToggleLeft className="h-5 w-5 text-muted-foreground/50" />
                                  )}
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Add Subject inline Form */}
                <form onSubmit={handleCreateSubject} className="mt-6 p-5 bg-muted/10 border border-border/60 rounded-xl space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Create New Subject
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Add a new subject to this stream. Subject name will be auto-capitalized.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Subject Name
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g. CHEMISTRY, HISTORY"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        disabled={isCreatingSubject}
                        className="h-10 bg-muted/20 border-border text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Subject Type
                      </label>
                      <Select
                        value={newSubjectType}
                        onValueChange={(val: any) => setNewSubjectType(val)}
                        disabled={isCreatingSubject}
                      >
                        <SelectTrigger className="h-10 text-xs bg-muted/20 border-border text-xs text-muted-foreground">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DOMAIN">DOMAIN (Major courses)</SelectItem>
                          <SelectItem value="NON_DOMAIN">NON_DOMAIN (General/Electives)</SelectItem>
                          <SelectItem value="LANGUAGE">LANGUAGE (Language/Communication)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      disabled={isCreatingSubject || !newSubjectName.trim()}
                      className="h-9 px-4 text-xs font-semibold cursor-pointer"
                    >
                      {isCreatingSubject ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Add Subject"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function StreamsSection() {
  const [searchInput, setSearchInput] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newStreamName, setNewStreamName] = useState("");
  const [selectedHodId, setSelectedHodId] = useState<string>("");
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const queryClient = useQueryClient();
  const { data: streams } = useSuspenseQuery({
    queryKey: streamQueryKeys.list(),
    queryFn: getStreams,
  });

  const { data: hodCandidatesData } = useHodCandidatesQuery();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create stream mutation
  const { mutate: createMutate, isPending: isCreatePending } = useMutation({
    mutationFn: (data: { name: string; hodId?: string }) => createStream(data.name, data.hodId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: streamQueryKeys.all });
      toast.success(res.message || "Stream created successfully");
      setNewStreamName("");
      setSelectedHodId("");
      setIsCreateOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create stream");
    },
  });

  // Delete stream mutation
  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: (streamId: string) => deleteStream(streamId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: streamQueryKeys.all });
      toast.success(res.message || "Stream deactivated successfully");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate stream");
    },
  });

  const handleCreateStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamName.trim()) {
      toast.error("Stream name cannot be empty");
      return;
    }
    createMutate({
      name: newStreamName.trim().toUpperCase(),
      hodId: selectedHodId || undefined,
    });
  };

  // Filter streams locally
  const filteredStreams = streams.filter((stream) =>
    stream.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const candidates = hodCandidatesData || [];

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200">
      {/* Header bar - connected filter and button areas */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border-b border-border bg-secondary/70">
        <div className="relative w-full sm:w-64 flex">
          <Input
            type="text"
            placeholder="Search streams..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pr-10 h-9 bg-muted/20 border-border focus-visible:ring-primary/20 text-sm w-full"
          />
          <span className="absolute right-3 top-2.5 text-muted-foreground select-none">
            <Search className="h-4 w-4" />
          </span>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="cursor-pointer gap-1.5 h-9 font-medium w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span>Add Stream</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateStream}>
              <DialogHeader>
                <DialogTitle className="font-semibold text-foreground">
                  Create New Stream
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-normal text-xs">
                  Create a new academic stream and optionally assign an initial Head of Department.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Stream Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. SCIENCE, COMMERCE"
                    value={newStreamName}
                    onChange={(e) => setNewStreamName(e.target.value)}
                    disabled={isCreatePending}
                    className="w-full bg-muted/20 border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Assign initial HOD (Optional)</label>
                  <Select value={selectedHodId} onValueChange={setSelectedHodId} disabled={isCreatePending}>
                    <SelectTrigger className="w-full bg-muted/20 border-border text-xs text-muted-foreground">
                      <SelectValue placeholder="Select Head of Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      {candidates.map((cand) => (
                        <SelectItem key={cand.id} value={cand.id}>
                          {cand.fullName} ({cand.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreatePending}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatePending} className="cursor-pointer">
                  {isCreatePending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabular Representation */}
      <div className="overflow-x-auto bg-card">
        <Table>
          <TableHeader className="bg-muted/15">
            <TableRow className="border-b border-border select-none">
              <TableHead className="font-medium text-muted-foreground text-xs uppercase px-6 py-3.5">
                Stream Name
              </TableHead>
              <TableHead className="font-medium text-muted-foreground text-xs uppercase px-6 py-3.5 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStreams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <ShieldAlert className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="font-medium text-foreground text-sm">
                      No streams found
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5 font-normal">
                      Try adjusting your search queries.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStreams.map((stream) => (
                <TableRow
                  key={stream.id}
                  className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                >
                  <TableCell className="px-6 py-3.5">
                    <button
                      onClick={() => setSelectedStreamId(stream.id)}
                      className="hover:underline text-left text-primary hover:text-primary/80 font-medium cursor-pointer"
                    >
                      {stream.name}
                    </button>
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutate(stream.id)}
                      disabled={isDeletePending}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer hover:bg-destructive/10 rounded-lg"
                      title="Deactivate Stream"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stream & Subjects Details Sheet */}
      <StreamDetailsSheet
        streamId={selectedStreamId}
        onClose={() => setSelectedStreamId(null)}
        isMobile={isMobile}
      />
    </div>
  );
}
