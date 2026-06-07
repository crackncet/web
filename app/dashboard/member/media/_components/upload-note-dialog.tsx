"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload-utils";
import { useCreateNoteMutation } from "../_queries/media.queries";
import { Subject } from "../_api/media.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, UploadCloud, FileText, Loader2 } from "lucide-react";

interface UploadNoteDialogProps {
  subjects: Subject[];
}

export function UploadNoteDialog({ subjects }: UploadNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const createNoteMutation = useCreateNoteMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Pre-populate asset name with file name (without extension)
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setName(cleanName);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSubjectId("");
    setName("");
    setUploading(false);
    setProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!subjectId) {
      toast.error("Please select a subject");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a file name");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // 1. Upload to Cloudflare R2
      const uploadResult = await uploadFile({
        file,
        onProgress: (p) => setProgress(p),
      });

      // 2. Save note metadata to backend database
      await createNoteMutation.mutateAsync({
        name: name.trim(),
        subjectId,
        fileKey: uploadResult.fileKey,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });

      toast.success("Note uploaded and registered successfully!");
      setOpen(false);
      handleReset();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to upload note asset");
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!uploading) {
        setOpen(val);
        if (!val) handleReset();
      }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1.5 text-xs font-semibold px-4 cursor-pointer">
          <Plus className="h-4 w-4" />
          Upload Note
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl select-none">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Upload Note Asset</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a study note, handout, or syllabus document (.pdf, .docx, .ppt, .pptx) for your assigned subjects. Max 100 MB.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">File Attachment</label>
            {!file ? (
              <div className="border border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer relative bg-slate-50/50 dark:bg-slate-900/50">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.ppt,.pptx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <UploadCloud className="h-8 w-8 text-muted-foreground/60 mb-2" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Choose document file</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">PDF, DOCX, PPT or PPTX up to 100MB</span>
              </div>
            ) : (
              <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-lg shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                {!uploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold px-2 h-8"
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Assign Subject</label>
            <Select
              value={subjectId}
              onValueChange={setSubjectId}
              disabled={uploading}
            >
              <SelectTrigger className="w-full bg-muted/20 border-border text-xs h-10 px-3">
                <SelectValue placeholder="Select one of your subjects" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Asset Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Asset Display Name</label>
            <Input
              type="text"
              placeholder="e.g. Biology Chapter 1 Lecture Notes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={uploading}
              className="h-10 text-xs bg-muted/20 border-border"
            />
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  Uploading note to storage...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="h-9 text-xs font-semibold border-border hover:bg-muted/10 cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={uploading}
              className="h-9 text-xs font-semibold gap-1.5 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Save Asset"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
