"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload-utils";
import { useCreateVideoMutation } from "../_queries/media.queries";
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
import { Plus, UploadCloud, Video, Image as ImageIcon, Loader2, Play } from "lucide-react";

interface UploadVideoDialogProps {
  subjects: Subject[];
}

export function UploadVideoDialog({ subjects }: UploadVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [customThumbnail, setCustomThumbnail] = useState<File | null>(null);
  const [autoThumbnail, setAutoThumbnail] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>("");
  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const createVideoMutation = useCreateVideoMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Helper: Extract video duration in seconds
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      const objectUrl = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(Math.round(video.duration));
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(0);
      };
      video.src = objectUrl;
    });
  };

  // Helper: Capture a thumbnail frame at 1s using Canvas
  const captureVideoFrame = (file: File, timeInSeconds = 1): Promise<{ file: File; url: string } | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(objectUrl);
              if (blob) {
                const frameFile = new File([blob], "auto-thumbnail.png", { type: "image/png" });
                const previewUrl = URL.createObjectURL(blob);
                resolve({ file: frameFile, url: previewUrl });
              } else {
                resolve(null);
              }
            }, "image/png");
          } else {
            URL.revokeObjectURL(objectUrl);
            resolve(null);
          }
        } catch (e) {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
      };

      video.onloadedmetadata = () => {
        // Seek to 1s or half duration if shorter
        video.currentTime = Math.min(timeInSeconds, video.duration / 2);
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
    });
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      
      if (extension !== ".mp4" && extension !== ".webm") {
        toast.error("Please upload an MP4 or WebM video file");
        return;
      }

      setVideoFile(file);
      setName(file.name.replace(/\.[^/.]+$/, ""));

      // 1. Extract duration
      const videoDuration = await getVideoDuration(file);
      setDuration(videoDuration);

      // 2. Generate automatic preview thumbnail
      setStatusMessage("Extracting preview frame...");
      const captured = await captureVideoFrame(file);
      if (captured) {
        setAutoThumbnail(captured.file);
        setThumbnailPreviewUrl(captured.url);
      }
      setStatusMessage("");
    }
  };

  const handleCustomThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCustomThumbnail(file);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setCustomThumbnail(null);
    setAutoThumbnail(null);
    setThumbnailPreviewUrl("");
    setSubjectId("");
    setName("");
    setDuration(0);
    setUploading(false);
    setUploadProgress(0);
    setStatusMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error("Please select a video file to upload");
      return;
    }
    if (!subjectId) {
      toast.error("Please select a subject");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter a video title");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Determine which thumbnail to use and upload it
      let finalThumbnailKey = "";
      const thumbFile = customThumbnail || autoThumbnail;

      if (thumbFile) {
        setStatusMessage("Uploading thumbnail image...");
        const thumbUpload = await uploadFile({
          file: thumbFile,
          onProgress: () => {},
        });
        finalThumbnailKey = thumbUpload.fileKey;
      } else {
        throw new Error("Could not prepare thumbnail image");
      }

      // 2. Upload video file (triggers chunked multipart uploads to S3)
      setStatusMessage("Uploading video content (in parts)...");
      const videoUpload = await uploadFile({
        file: videoFile,
        onProgress: (p) => setUploadProgress(p),
      });

      // 3. Register asset in DB (marks status as PROCESSING, resolves HLS path)
      setStatusMessage("Registering video in library...");
      await createVideoMutation.mutateAsync({
        name: name.trim(),
        subjectId,
        thumbnailKey: finalThumbnailKey,
        mimeType: videoFile.type || "video/mp4",
        sizeBytes: videoFile.size,
        durationSeconds: duration || 1,
      });

      toast.success("Video uploaded and sent to queue for transcoding!");
      setOpen(false);
      handleReset();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to upload video asset");
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
          Upload Video
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl select-none">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Upload Video Lecture</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload a video lecture (.mp4, .webm). It will be securely transcoded to HLS for adaptive quality streaming. Max 10 GB.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* File Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Video File</label>
            {!videoFile ? (
              <div className="border border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer relative bg-slate-50/50 dark:bg-slate-900/50">
                <input
                  type="file"
                  onChange={handleVideoChange}
                  accept=".mp4,.webm"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Video className="h-10 w-10 text-muted-foreground/60 mb-2" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Choose MP4 or WebM video file</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Supports high-quality files up to 10 GB</span>
              </div>
            ) : (
              <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 bg-primary/10 text-primary flex items-center justify-center rounded-lg shrink-0">
                    <Play className="h-5 w-5 fill-current" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[280px]">
                      {videoFile.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB • {Math.floor(duration / 60)}m {duration % 60}s
                    </span>
                  </div>
                </div>
                {!uploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setVideoFile(null);
                      setThumbnailPreviewUrl("");
                      setAutoThumbnail(null);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold px-2 h-8"
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Panel */}
          {videoFile && (
            <div className="grid grid-cols-5 gap-4 items-center bg-slate-50/30 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
              <div className="col-span-2 relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                {thumbnailPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnailPreviewUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="col-span-3 space-y-1.5">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase block">Video Thumbnail</span>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  {customThumbnail 
                    ? "Using custom uploaded image." 
                    : "Auto-captured frame from 0:01s. You can upload a custom cover."}
                </p>
                {!uploading && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="h-7 text-[10px] font-semibold border-border bg-white dark:bg-slate-900 cursor-pointer"
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Upload Custom
                    </Button>
                    {customThumbnail && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCustomThumbnail(null);
                          if (autoThumbnail) {
                            setThumbnailPreviewUrl(URL.createObjectURL(autoThumbnail));
                          }
                        }}
                        className="h-7 text-[10px] font-semibold text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        Reset to Auto
                      </Button>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  onChange={handleCustomThumbnailChange}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />
              </div>
            </div>
          )}

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
            <label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Video Title</label>
            <Input
              type="text"
              placeholder="e.g. Physics Chapter 3: Electromagnetic Induction"
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
                  {statusMessage || "Processing..."}
                </span>
                {uploadProgress > 0 && <span>{uploadProgress}%</span>}
              </div>
              {uploadProgress > 0 && (
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
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
                "Upload Video"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
