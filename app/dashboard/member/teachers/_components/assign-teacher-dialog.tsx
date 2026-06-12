"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import {
  useCandidatesQuery,
  useStreamSubjectsQuery,
  useAssignTeachingStaffMutation,
} from "../_queries/teachers.queries";

export function AssignTeacherDialog() {
  const [open, setOpen] = useState(false);
  const { data: user, isLoading: isUserLoading } = useUser();

  // Inputs
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedStreamId, setSelectedStreamId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [collegeName, setCollegeName] = useState<string>("");
  const [role, setRole] = useState<"TEACHER" | "TA">("TEACHER");
  const [candidateSearch, setCandidateSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(candidateSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [candidateSearch]);

  // Queries
  const { data: candidates, isLoading: isCandidatesLoading } = useCandidatesQuery(debouncedSearch);
  const { data: subjects, isLoading: isSubjectsLoading } = useStreamSubjectsQuery(selectedStreamId);

  // Mutation
  const assignMutation = useAssignTeachingStaffMutation();

  // Get streams where current user is HOD
  const myStreams = user?.hodStreams || [];

  // Reset subject selection when stream changes
  useEffect(() => {
    setSelectedSubjectId("");
  }, [selectedStreamId]);

  const resetForm = () => {
    setSelectedUserId("");
    setSelectedStreamId("");
    setSelectedSubjectId("");
    setCollegeName("");
    setRole("TEACHER");
    setCandidateSearch("");
    setDebouncedSearch("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error("Please select a candidate");
      return;
    }
    if (!selectedStreamId) {
      toast.error("Please select a stream");
      return;
    }
    if (!selectedSubjectId) {
      toast.error("Please select a subject");
      return;
    }
    if (!collegeName.trim()) {
      toast.error("Please enter a college name");
      return;
    }

    assignMutation.mutate(
      {
        userId: selectedUserId,
        subjectId: selectedSubjectId,
        collegeName: collegeName.trim(),
        role,
      },
      {
        onSuccess: () => {
          toast.success("Teacher assigned successfully!");
          resetForm();
          setOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to assign teacher");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="font-bold text-xs h-8 cursor-pointer select-none">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Assign Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="font-bold text-lg text-foreground tracking-tight">
              Assign Subject Teacher
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-normal text-xs leading-relaxed">
              Assign an active team member to a subject in your managed stream.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 select-none">
            {/* Candidate Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Select Candidate</label>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Type to search candidate by name or email..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  disabled={assignMutation.isPending}
                  className="w-full bg-muted/20 hover:bg-muted/30 border-border text-xs h-9 px-3 transition-colors duration-200"
                />
                <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={assignMutation.isPending}>
                  <SelectTrigger className="w-full bg-muted/20 hover:bg-muted/30 border-border text-sm text-foreground h-10 px-3 transition-colors duration-200">
                    <SelectValue placeholder={isCandidatesLoading ? "Loading candidates..." : "Select candidate..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {isCandidatesLoading ? (
                      <div className="flex items-center justify-center p-3 text-xs text-muted-foreground gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        <span>Searching...</span>
                      </div>
                    ) : candidates?.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-3 text-center">No active candidate profiles found</div>
                    ) : (
                      candidates?.map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id} className="text-sm py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{candidate.fullName}</span>
                            <span className="text-xs text-muted-foreground font-normal">({candidate.email})</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stream Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Managed Stream</label>
              <Select value={selectedStreamId} onValueChange={setSelectedStreamId} disabled={assignMutation.isPending}>
                <SelectTrigger className="w-full bg-muted/20 hover:bg-muted/30 border-border text-sm text-foreground h-10 px-3 transition-colors duration-200">
                  <SelectValue placeholder={isUserLoading ? "Loading streams..." : "Select stream..."} />
                </SelectTrigger>
                <SelectContent>
                  {myStreams.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-3 text-center">No managed streams found</div>
                  ) : (
                    myStreams.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-sm py-2.5">
                        {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Subject</label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
                disabled={!selectedStreamId || isSubjectsLoading || assignMutation.isPending}
              >
                <SelectTrigger className="w-full bg-muted/20 hover:bg-muted/30 border-border text-sm text-foreground h-10 px-3 transition-colors duration-200">
                  <SelectValue placeholder={
                    !selectedStreamId 
                      ? "Select stream first..." 
                      : isSubjectsLoading 
                        ? "Loading subjects..." 
                        : "Select subject..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-3 text-center">No subjects in this stream</div>
                  ) : (
                    subjects?.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id} className="text-sm py-2.5">
                        {sub.name} ({sub.type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Role Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Role</label>
              <Select 
                value={role} 
                onValueChange={(val: "TEACHER" | "TA") => setRole(val)} 
                disabled={assignMutation.isPending}
              >
                <SelectTrigger className="w-full bg-muted/20 hover:bg-muted/30 border-border text-sm text-foreground h-10 px-3 transition-colors duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER" className="text-sm py-2.5">TEACHER</SelectItem>
                  <SelectItem value="TA" className="text-sm py-2.5">TA (Teaching Assistant)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* College Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">College / Affiliation Name</label>
              <Input
                type="text"
                placeholder="e.g. DELHI UNIVERSITY"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                disabled={assignMutation.isPending}
                className="w-full bg-muted/20 hover:bg-muted/30 border-border text-sm h-10 px-3 transition-colors duration-200"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setOpen(false)}
              disabled={assignMutation.isPending}
              className="text-xs font-semibold h-10 cursor-pointer px-4 border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="default"
              disabled={assignMutation.isPending}
              className="text-xs font-semibold h-10 cursor-pointer px-5"
            >
              {assignMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                "Assign Staff"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
