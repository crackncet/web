"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Edit2, Loader2, Plus, Save, X, FileText, BarChart2, Eye, Radio, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useChapterWithTopicsQuery,
  useUpdateChapterMutation,
  useCreateTopicMutation,
  useLibraryNotesQuery,
  useLibraryQuestionBanksQuery,
  useUpdateChapterMaterialsMutation,
  useSubjectDetailQuery,
  useUpdateTopicMutation,
  useUpdateTopicMaterialsMutation,
  useTopicDetailQuery,
  useLibraryVideosQuery,
  useLibraryLiveLecturesQuery,
} from "../_queries/courses.queries";
import { toast } from "sonner";

interface ChapterDetailWorkspaceProps {
  courseId: string;
  courseSubjectId: string;
  chapterId: string;
  isAssignedTeacher: boolean;
}

export default function ChapterDetailWorkspace({
  courseId,
  courseSubjectId,
  chapterId,
  isAssignedTeacher,
}: ChapterDetailWorkspaceProps) {
  // Subject Detail Query to retrieve global subjectId (runs in background, cached)
  const { data: subjectResponse } = useSubjectDetailQuery(courseId, courseSubjectId);
  const subjectId = subjectResponse?.data?.subjectId || "";

  // Local state for editing chapter
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSerialNumber, setEditSerialNumber] = useState("");
  const [editNotesAssetId, setEditNotesAssetId] = useState<string>("none");
  const [editPracticeBankId, setEditPracticeBankId] = useState<string>("none");

  // Local state for adding topic
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [topicSerialNumber, setTopicSerialNumber] = useState("");

  // Local state for topic details dialog
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editTopicName, setEditTopicName] = useState("");
  const [editTopicSerialNumber, setEditTopicSerialNumber] = useState("");
  const [editTopicVideoId, setEditTopicVideoId] = useState("none");
  const [editTopicLiveId, setEditTopicLiveId] = useState("none");
  const [editTopicNoteId, setEditTopicNoteId] = useState("none");
  const [editTopicDppId, setEditTopicDppId] = useState("none");
  const [isSavingTopic, setIsSavingTopic] = useState(false);

  // Queries & Mutations
  const { data: response, isLoading, error } = useChapterWithTopicsQuery(
    courseId,
    courseSubjectId,
    chapterId
  );

  const updateChapterMutation = useUpdateChapterMutation();
  const updateChapterMaterialsMutation = useUpdateChapterMaterialsMutation();
  const createTopicMutation = useCreateTopicMutation();

  const updateTopicMutation = useUpdateTopicMutation();
  const updateTopicMaterialsMutation = useUpdateTopicMaterialsMutation();

  // Fetch single topic details when selected
  const { data: topicDetailResponse, isLoading: isLoadingTopicDetail } = useTopicDetailQuery(
    courseId,
    courseSubjectId,
    chapterId,
    selectedTopicId || "",
    !!selectedTopicId
  );
  const topicDetail = topicDetailResponse?.data;

  // Load Library Notes & Question Banks for Chapter Edit (only when editing and assigned as teacher)
  const { data: notesResponse } = useLibraryNotesQuery(
    subjectId,
    !!subjectId && isEditingChapter && isAssignedTeacher
  );
  const { data: qbsResponse } = useLibraryQuestionBanksQuery(
    subjectId,
    !!subjectId && isEditingChapter && isAssignedTeacher
  );

  // Load library lists for Topic Edit dropdowns
  const { data: libraryVideosResponse } = useLibraryVideosQuery(
    subjectId,
    !!subjectId && !!selectedTopicId && isEditingTopic && isAssignedTeacher
  );
  const { data: libraryLiveLecturesResponse } = useLibraryLiveLecturesQuery(
    subjectId,
    !!subjectId && !!selectedTopicId && isEditingTopic && isAssignedTeacher
  );
  const { data: libraryNotesResponse } = useLibraryNotesQuery(
    subjectId,
    !!subjectId && !!selectedTopicId && isEditingTopic && isAssignedTeacher
  );
  const { data: libraryQbsResponse } = useLibraryQuestionBanksQuery(
    subjectId,
    !!subjectId && !!selectedTopicId && isEditingTopic && isAssignedTeacher
  );

  const notesList = notesResponse?.data || [];
  const qbsList = qbsResponse?.data || [];

  const libraryVideos = libraryVideosResponse?.data || [];
  const libraryLiveLectures = libraryLiveLecturesResponse?.data || [];
  const libraryNotes = libraryNotesResponse?.data || [];
  const libraryQbs = libraryQbsResponse?.data || [];

  const chapterData = response?.data;
  const topics = chapterData?.topics || [];

  // Reset edit state when chapter data loaded
  useEffect(() => {
    if (chapterData) {
      setEditName(chapterData.name);
      setEditSerialNumber(String(chapterData.serialNumber));
      setEditNotesAssetId(chapterData.notesAssetId || "none");
      setEditPracticeBankId(chapterData.chapterPracticeBankId || "none");
    }
  }, [chapterData]);

  // Reset topic edit state when topic details loaded
  useEffect(() => {
    if (topicDetail) {
      setEditTopicName(topicDetail.name);
      setEditTopicSerialNumber(String(topicDetail.serialNumber));
      setEditTopicVideoId(topicDetail.videoLectureId || "none");
      setEditTopicLiveId(topicDetail.liveLectureId || "none");
      setEditTopicNoteId(topicDetail.notesAssetId || "none");
      setEditTopicDppId(topicDetail.dppBankId || "none");
    }
  }, [topicDetail]);

  const handleSaveTopic = async () => {
    if (!selectedTopicId) return;
    if (!editTopicName.trim()) {
      toast.error("Topic name cannot be empty");
      return;
    }
    const serial = parseInt(editTopicSerialNumber, 10);
    if (isNaN(serial) || serial <= 0) {
      toast.error("Serial number must be a valid positive integer");
      return;
    }

    setIsSavingTopic(true);
    try {
      // 1. Save metadata (name, serial number)
      await updateTopicMutation.mutateAsync({
        courseId,
        courseSubjectId,
        chapterId,
        topicId: selectedTopicId,
        data: {
          name: editTopicName,
          serialNumber: serial,
        },
      });

      // 2. Save materials
      await updateTopicMaterialsMutation.mutateAsync({
        courseId,
        courseSubjectId,
        chapterId,
        topicId: selectedTopicId,
        data: {
          videoLectureId: editTopicVideoId === "none" ? null : editTopicVideoId,
          liveLectureId: editTopicLiveId === "none" ? null : editTopicLiveId,
          notesAssetId: editTopicNoteId === "none" ? null : editTopicNoteId,
          dppBankId: editTopicDppId === "none" ? null : editTopicDppId,
        },
      });

      // Invalidate chapter details to refresh the main view
      setIsEditingTopic(false);
    } catch (err) {
      // Mutation handles error toast
    } finally {
      setIsSavingTopic(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 flex-grow gap-2 min-h-[300px]">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <p className="text-[11px] text-muted-foreground font-medium">Loading chapter details...</p>
      </div>
    );
  }

  if (error || !chapterData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 flex-grow text-center text-muted-foreground gap-2 min-h-[300px]">
        <BookOpen className="h-8 w-8 text-rose-500" />
        <p className="text-xs font-semibold text-rose-500">Failed to load chapter content</p>
        <p className="text-[10px] max-w-[200px]">
          {error instanceof Error ? error.message : "Chapter not found or access denied."}
        </p>
      </div>
    );
  }

  const handleSaveChapter = () => {
    if (!editName.trim()) {
      toast.error("Chapter name cannot be empty");
      return;
    }
    const serial = parseInt(editSerialNumber, 10);
    if (isNaN(serial) || serial <= 0) {
      toast.error("Serial number must be a positive integer");
      return;
    }

    const metadataChanged =
      editName.trim() !== chapterData.name ||
      serial !== chapterData.serialNumber;

    const materialsChanged =
      editNotesAssetId !== (chapterData.notesAssetId || "none") ||
      editPracticeBankId !== (chapterData.chapterPracticeBankId || "none");

    const promises: Promise<any>[] = [];

    if (metadataChanged) {
      promises.push(
        new Promise((resolve, reject) => {
          updateChapterMutation.mutate(
            {
              courseId,
              courseSubjectId,
              chapterId,
              data: {
                name: editName.trim(),
                serialNumber: serial,
              },
            },
            { onSuccess: resolve, onError: reject }
          );
        })
      );
    }

    if (materialsChanged) {
      promises.push(
        new Promise((resolve, reject) => {
          updateChapterMaterialsMutation.mutate(
            {
              courseId,
              courseSubjectId,
              chapterId,
              data: {
                notesAssetId: editNotesAssetId === "none" ? null : editNotesAssetId,
                chapterPracticeBankId: editPracticeBankId === "none" ? null : editPracticeBankId,
              },
            },
            { onSuccess: resolve, onError: reject }
          );
        })
      );
    }

    if (promises.length > 0) {
      Promise.all(promises)
        .then(() => {
          setIsEditingChapter(false);
        })
        .catch(() => {
          // Toast errors already shown by react-query onError config
        });
    } else {
      setIsEditingChapter(false);
    }
  };

  const handleOpenAddTopic = () => {
    const maxSerial = topics.reduce((max, t) => (t.serialNumber > max ? t.serialNumber : max), 0);
    setTopicSerialNumber(String(maxSerial + 1));
    setTopicName("");
    setIsAddTopicOpen(true);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) {
      toast.error("Please enter a topic name");
      return;
    }
    const serial = parseInt(topicSerialNumber, 10);
    if (isNaN(serial) || serial <= 0) {
      toast.error("Please enter a positive integer serial number");
      return;
    }

    createTopicMutation.mutate(
      {
        courseId,
        courseSubjectId,
        chapterId,
        data: {
          name: topicName.trim(),
          serialNumber: serial,
        },
      },
      {
        onSuccess: () => {
          setIsAddTopicOpen(false);
          setTopicName("");
        },
      }
    );
  };

  // Find linked asset titles for display
  const linkedNote = notesList.find((n) => n.id === chapterData.notesAssetId);
  const linkedQb = qbsList.find((q) => q.id === chapterData.chapterPracticeBankId);

  // Sort topics by serial number ascending
  const sortedTopics = [...topics].sort((a, b) => a.serialNumber - b.serialNumber);

  const isSaving = updateChapterMutation.isPending || updateChapterMaterialsMutation.isPending;

  return (
    <div className="p-4 flex flex-col flex-grow gap-4">
      {/* SEPARATION 1: Chapter Settings/Metadata */}
      <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl p-3">
        {isEditingChapter ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Edit Chapter & Materials</span>
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => setIsEditingChapter(false)}
                  size="xs"
                  variant="ghost"
                  className="h-6 text-[10px] gap-1 cursor-pointer"
                  disabled={isSaving}
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChapter}
                  size="xs"
                  className="h-6 text-[10px] gap-1 cursor-pointer bg-primary text-white"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  Save
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <Label htmlFor="editSerial" className="text-[9px] uppercase font-bold text-slate-400">S.No.</Label>
                <Input
                  id="editSerial"
                  type="number"
                  value={editSerialNumber}
                  onChange={(e) => setEditSerialNumber(e.target.value)}
                  className="h-8 text-xs bg-white dark:bg-slate-950 mt-1 border-slate-200 dark:border-slate-850 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="col-span-3">
                <Label htmlFor="editName" className="text-[9px] uppercase font-bold text-slate-400">Name</Label>
                <Input
                  id="editName"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 text-xs bg-white dark:bg-slate-955/10 mt-1 border-slate-200 dark:border-slate-850 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="flex flex-col gap-1">
                <Label htmlFor="noteSelect" className="text-[9px] uppercase font-bold text-slate-400">Chapter Note</Label>
                <Select value={editNotesAssetId} onValueChange={setEditNotesAssetId}>
                  <SelectTrigger
                    id="noteSelect"
                    className="w-full h-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 rounded-lg justify-between"
                  >
                    <SelectValue placeholder="Select note..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Unlink)</SelectItem>
                    {notesList.map((note) => (
                      <SelectItem key={note.id} value={note.id}>
                        {note.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="qbSelect" className="text-[9px] uppercase font-bold text-slate-400">Practice Bank</Label>
                <Select value={editPracticeBankId} onValueChange={setEditPracticeBankId}>
                  <SelectTrigger
                    id="qbSelect"
                    className="w-full h-8 text-xs bg-white dark:bg-slate-955/10 border-slate-200 dark:border-slate-855 rounded-lg justify-between"
                  >
                    <SelectValue placeholder="Select bank..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Unlink)</SelectItem>
                    {qbsList.map((qb) => (
                      <SelectItem key={qb.id} value={qb.id}>
                        {qb.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-primary">
                  Chapter {chapterData.serialNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 leading-snug">
                  {chapterData.name}
                </h3>
              </div>
              {isAssignedTeacher && (
                <Button
                  onClick={() => setIsEditingChapter(true)}
                  size="xs"
                  variant="outline"
                  className="h-6 gap-1 text-[10px] px-2 shrink-0 border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                  <Edit2 className="h-2.5 w-2.5" />
                  Edit
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="flex items-center justify-between bg-white dark:bg-slate-955/10 px-2.5 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-850/80">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Chapter Note</span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate" title={linkedNote?.name || chapterData.notesAssetName || undefined}>
                      {linkedNote ? linkedNote.name : chapterData.notesAssetName ? chapterData.notesAssetName : chapterData.notesAssetId ? "Linked Note" : "Not linked yet"}
                    </span>
                  </div>
                </div>
                {chapterData.notesAssetId && (
                  <Link href={`/dashboard/member/media/${chapterData.notesAssetId}/view`}>
                    <Button size="icon-xs" variant="ghost" className="h-5 w-5 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer" title="View Note">
                      <Eye className="h-3 w-3 text-slate-500" />
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-slate-955/10 px-2.5 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-850/80">
                <div className="flex items-center gap-2 min-w-0">
                  <BarChart2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Practice Bank</span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate" title={linkedQb?.title || chapterData.chapterPracticeBankTitle || undefined}>
                      {linkedQb ? linkedQb.title : chapterData.chapterPracticeBankTitle ? chapterData.chapterPracticeBankTitle : chapterData.chapterPracticeBankId ? "Linked Practice Bank" : "Not linked yet"}
                    </span>
                  </div>
                </div>
                {chapterData.chapterPracticeBankId && (
                  <Link href={`/dashboard/member/question-banks/${chapterData.chapterPracticeBankId}/view`}>
                    <Button size="icon-xs" variant="ghost" className="h-5 w-5 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer" title="View Practice Bank">
                      <Eye className="h-3 w-3 text-slate-500" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEPARATION 2: Topics Table */}
      <div className="flex flex-col flex-grow">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-850">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Topics List</h4>
            <span className="text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md">
              {sortedTopics.length} Total
            </span>
          </div>
          {isAssignedTeacher && (
            <Button
              onClick={handleOpenAddTopic}
              size="sm"
              className="h-6 gap-1 text-[10px] px-2 py-3 cursor-pointer"
            >
              <Plus className="h-2.5 w-2.5" />
              Add Topic
            </Button>
          )}
        </div>

        {sortedTopics.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-150 dark:border-slate-800/60 rounded-xl p-6 text-center bg-slate-50/20 dark:bg-slate-955/10 min-h-[160px]">
            <BookOpen className="h-6 w-6 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">No topics added to this chapter yet.</p>
            {isAssignedTeacher && (
              <p className="text-[9px] text-slate-400 mt-0.5">Click "Add Topic" to create the first topic.</p>
            )}
          </div>
        ) : (
          <div className="border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden bg-white dark:bg-slate-900/40">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-955/20 hover:bg-slate-50/50 dark:hover:bg-slate-955/20 border-b border-slate-200/60 dark:border-slate-850">
                  <TableHead className="font-bold text-[9px] uppercase text-slate-400 tracking-wider h-8 px-4 w-16">S.No.</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-slate-400 tracking-wider h-8 px-2">Topic Name</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase text-slate-400 tracking-wider h-8 px-4 text-right w-20">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTopics.map((topic) => (
                  <TableRow
                    key={topic.id}
                    className="border-b border-slate-100 dark:border-slate-800/60 transition-colors duration-150 hover:bg-slate-50/40 dark:hover:bg-slate-800/20"
                  >
                    <TableCell className="align-middle px-4 py-2">
                      <span className="text-xs font-normal text-slate-500">
                        {topic.serialNumber}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle px-2 py-2">
                      <span className="text-xs font-normal text-slate-700 dark:text-slate-300">
                        {topic.name}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle px-4 py-2 text-right">
                      <Button
                        onClick={() => {
                          setSelectedTopicId(topic.id);
                          setIsEditingTopic(false);
                        }}
                        size="xs"
                        variant="ghost"
                        className="h-6 gap-1 text-[10px] px-2 text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Topic Dialog */}
      <Dialog open={isAddTopicOpen} onOpenChange={setIsAddTopicOpen}>
        <DialogContent className="sm:max-w-md rounded-xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
          <form onSubmit={handleCreateTopic}>
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-850">
              <DialogTitle className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Add New Topic
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                Create a new topic to organize video lectures and study materials in this chapter.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3.5 py-4">
              <div className="grid gap-1">
                <Label htmlFor="topicSerial" className="text-[10px] uppercase font-bold text-slate-400">
                  Serial Number
                </Label>
                <Input
                  id="topicSerial"
                  type="number"
                  placeholder="e.g. 1"
                  value={topicSerialNumber}
                  onChange={(e) => setTopicSerialNumber(e.target.value)}
                  className="h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary bg-slate-50/50 dark:bg-slate-950"
                  required
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="topicName" className="text-[10px] uppercase font-bold text-slate-400">
                  Topic Name
                </Label>
                <Input
                  id="topicName"
                  type="text"
                  placeholder="e.g. Limits and Continuity"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary bg-slate-50/50 dark:bg-slate-955/10"
                  required
                />
              </div>
            </div>

            <DialogFooter className="flex-row justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddTopicOpen(false)}
                className="text-xs h-8 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs h-8 cursor-pointer"
                disabled={createTopicMutation.isPending}
              >
                {createTopicMutation.isPending ? "Adding..." : "Add Topic"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Topic Detail Dialog */}
      <Dialog open={!!selectedTopicId} onOpenChange={(open) => { if (!open) setSelectedTopicId(null); }}>
        <DialogContent className="sm:max-w-2xl rounded-xl p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          {isLoadingTopicDetail ? (
            <div className="flex flex-col items-center justify-center p-16 gap-2">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Loading topic details...</p>
            </div>
          ) : topicDetail ? (
            <div className="space-y-4">
              <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <DialogTitle className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Topic Details
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    View topic content and manage linked study materials.
                  </DialogDescription>
                </div>
              </DialogHeader>

              {isEditingTopic ? (
                <div className="grid gap-5 py-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-1">
                      <Label htmlFor="editTopicSerial" className="text-[10px] uppercase font-bold text-slate-400">S.No.</Label>
                      <Input
                        id="editTopicSerial"
                        type="number"
                        value={editTopicSerialNumber}
                        onChange={(e) => setEditTopicSerialNumber(e.target.value)}
                        className="h-9 text-xs bg-white dark:bg-slate-950 mt-1.5 border-slate-200 dark:border-slate-850 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="col-span-3">
                      <Label htmlFor="editTopicName" className="text-[10px] uppercase font-bold text-slate-400">Topic Name</Label>
                      <Input
                        id="editTopicName"
                        type="text"
                        value={editTopicName}
                        onChange={(e) => setEditTopicName(e.target.value)}
                        className="h-9 text-xs bg-white dark:bg-slate-955/10 mt-1.5 border-slate-200 dark:border-slate-850 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="editTopicVideo" className="text-[10px] uppercase font-bold text-slate-400">Video Lecture</Label>
                      <Select value={editTopicVideoId} onValueChange={setEditTopicVideoId}>
                        <SelectTrigger id="editTopicVideo" className="w-full h-9 text-xs bg-white dark:bg-slate-955/10 border-slate-200 dark:border-slate-855 rounded-lg justify-between mt-1">
                          <SelectValue placeholder="Select video..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Unlink)</SelectItem>
                          {libraryVideos.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="editTopicLive" className="text-[10px] uppercase font-bold text-slate-400">Live Lecture</Label>
                      <Select value={editTopicLiveId} onValueChange={setEditTopicLiveId}>
                        <SelectTrigger id="editTopicLive" className="w-full h-9 text-xs bg-white dark:bg-slate-955/10 border-slate-200 dark:border-slate-855 rounded-lg justify-between mt-1">
                          <SelectValue placeholder="Select live lecture..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Unlink)</SelectItem>
                          {libraryLiveLectures.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="editTopicNote" className="text-[10px] uppercase font-bold text-slate-400">Study Note</Label>
                      <Select value={editTopicNoteId} onValueChange={setEditTopicNoteId}>
                        <SelectTrigger id="editTopicNote" className="w-full h-9 text-xs bg-white dark:bg-slate-955/10 border-slate-200 dark:border-slate-855 rounded-lg justify-between mt-1">
                          <SelectValue placeholder="Select note..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Unlink)</SelectItem>
                          {libraryNotes.map((n) => (
                            <SelectItem key={n.id} value={n.id}>
                              {n.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="editTopicDpp" className="text-[10px] uppercase font-bold text-slate-400">DPP Bank</Label>
                      <Select value={editTopicDppId} onValueChange={setEditTopicDppId}>
                        <SelectTrigger id="editTopicDpp" className="w-full h-9 text-xs bg-white dark:bg-slate-955/10 border-slate-200 dark:border-slate-855 rounded-lg justify-between mt-1">
                          <SelectValue placeholder="Select DPP..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Unlink)</SelectItem>
                          {libraryQbs.map((q) => (
                            <SelectItem key={q.id} value={q.id}>
                              {q.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-6">
                  <div className="flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-primary">
                        Topic {topicDetail.serialNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white mt-1 leading-snug truncate">
                        {topicDetail.name}
                      </h3>
                    </div>
                    {isAssignedTeacher && (
                      <Button
                        onClick={() => setIsEditingTopic(true)}
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-xs px-3 border-slate-200 dark:border-slate-800 cursor-pointer shrink-0"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit Details
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-955/10 px-3.5 py-3 rounded-lg border border-slate-200/50 dark:border-slate-850/80">
                      <div className="flex items-center gap-3 min-w-0">
                        <Video className="h-4 w-4 text-slate-400 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Video Lecture</span>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mt-0.5" title={topicDetail.videoLectureTitle || undefined}>
                            {topicDetail.videoLectureTitle || (topicDetail.videoLectureId ? "Linked Video" : "Not linked")}
                          </span>
                        </div>
                      </div>
                      {topicDetail.videoLectureId && (
                        <Link href={`/dashboard/member/media/${topicDetail.videoLectureId}/view`}>
                          <Button size="icon-xs" variant="ghost" className="h-6 w-6 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer" title="View Video">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-955/10 px-3.5 py-3 rounded-lg border border-slate-200/50 dark:border-slate-850/80">
                      <Radio className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Live Lecture</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mt-0.5" title={topicDetail.liveLectureTitle || undefined}>
                          {topicDetail.liveLectureTitle || (topicDetail.liveLectureId ? "Linked Live Lecture" : "Not linked")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-955/10 px-3.5 py-3 rounded-lg border border-slate-200/50 dark:border-slate-850/80">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Study Note</span>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mt-0.5" title={topicDetail.notesAssetTitle || undefined}>
                            {topicDetail.notesAssetTitle || (topicDetail.notesAssetId ? "Linked Note" : "Not linked")}
                          </span>
                        </div>
                      </div>
                      {topicDetail.notesAssetId && (
                        <Link href={`/dashboard/member/media/${topicDetail.notesAssetId}/view`}>
                          <Button size="icon-xs" variant="ghost" className="h-6 w-6 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer" title="View Note">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-955/10 px-3.5 py-3 rounded-lg border border-slate-200/50 dark:border-slate-850/80">
                      <div className="flex items-center gap-3 min-w-0">
                        <BarChart2 className="h-4 w-4 text-slate-400 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">DPP Bank</span>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mt-0.5" title={topicDetail.dppBankTitle || undefined}>
                            {topicDetail.dppBankTitle || (topicDetail.dppBankId ? "Linked DPP" : "Not linked")}
                          </span>
                        </div>
                      </div>
                      {topicDetail.dppBankId && (
                        <Link href={`/dashboard/member/question-banks/${topicDetail.dppBankId}/view`}>
                          <Button size="icon-xs" variant="ghost" className="h-6 w-6 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer" title="View DPP">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex-row justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-850">
                {isEditingTopic ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingTopic(false)}
                      className="text-xs h-9 cursor-pointer"
                      disabled={isSavingTopic}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveTopic}
                      className="text-xs h-9 cursor-pointer bg-primary text-white"
                      disabled={isSavingTopic}
                    >
                      {isSavingTopic ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTopicId(null)}
                    className="text-xs h-9 cursor-pointer"
                  >
                    Close
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
