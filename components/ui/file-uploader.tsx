"use client";

import React, { useState, useRef, DragEvent } from "react";
import { UploadCloud, FileText, Video, Image as ImageIcon, Loader2, CheckCircle2, X } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";
import { uploadFile, validateFileConstraints, UploadResult } from "@/lib/upload-utils";

interface FileUploaderProps {
  label?: string;
  accept?: string; // e.g. "image/*", "video/*", ".pdf"
  maxSize?: number; // size in bytes
  onUploadComplete?: (result: UploadResult) => void;
  className?: string;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function FileUploader({
  label = "Upload file",
  accept,
  onUploadComplete,
  className = "",
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (selectedFile: File) => {
    try {
      // Validate types and constraints
      validateFileConstraints(selectedFile);
      setFile(selectedFile);
      setUploadState("idle");
      setProgress(0);
      setErrorMsg("");
      setResult(null);
    } catch (err: any) {
      toast.error(err.message || "Invalid file chosen");
      setErrorMsg(err.message || "Invalid file chosen");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const startUpload = async () => {
    if (!file) return;

    setUploadState("uploading");
    setProgress(0);
    setErrorMsg("");

    try {
      const uploadRes = await uploadFile({
        file,
        onProgress: (p) => {
          setProgress(p);
        },
      });

      setUploadState("success");
      setResult(uploadRes);
      toast.success("File uploaded successfully");
      onUploadComplete?.(uploadRes);
    } catch (err: any) {
      console.error("Upload error:", err);
      const msg = err.message || "Failed to upload file. Please try again.";
      setUploadState("error");
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
    setErrorMsg("");
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = () => {
    if (!file) return <UploadCloud className="h-10 w-10 text-muted-foreground/80 mb-2" />;
    const name = file.name.toLowerCase();
    if (name.endsWith(".mp4") || name.endsWith(".webm")) {
      return <Video className="h-8 w-8 text-primary" />;
    }
    if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".webp")) {
      return <ImageIcon className="h-8 w-8 text-indigo-500" />;
    }
    return <FileText className="h-8 w-8 text-amber-500" />;
  };

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="text-sm font-semibold text-foreground/90 block mb-2">{label}</label>}

      {/* Drag & Drop Area */}
      {uploadState === "idle" && !file && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none bg-muted/10 ${
            isDragActive 
              ? "border-primary bg-primary/5 scale-[0.99]" 
              : "border-border hover:border-primary/50 hover:bg-muted/20"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept={accept}
            className="hidden"
          />
          {getFileIcon()}
          <p className="text-sm font-medium text-foreground">
            Drag & drop your file here, or <span className="text-primary hover:underline">browse</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 font-normal max-w-xs">
            Supports PDF, DOCX, PPT, PPTX (Max 100MB), JPG, PNG, WEBP (Max 5MB), and MP4, WEBM (Max 10GB).
          </p>
        </div>
      )}

      {/* Selected File Details & Actions */}
      {file && (
        <div className="border border-border rounded-xl p-4 bg-card select-none">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-muted rounded-lg shrink-0">
                {getFileIcon()}
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-sm font-medium text-foreground truncate max-w-[240px] sm:max-w-[360px]">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  {formatBytes(file.size)}
                </span>
              </div>
            </div>

            {/* Cancel Button */}
            {uploadState !== "uploading" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSelection}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress / Status display */}
          {uploadState === "uploading" && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span>Uploading to cloud storage...</span>
                </div>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {uploadState === "success" && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium mt-3">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>File uploaded successfully! Ready to submit.</span>
            </div>
          )}

          {uploadState === "error" && (
            <div className="space-y-2.5 mt-3">
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-normal">
                {errorMsg}
              </div>
              <Button onClick={startUpload} size="sm" className="w-full text-xs font-medium cursor-pointer">
                Retry Upload
              </Button>
            </div>
          )}

          {/* Upload Button */}
          {uploadState === "idle" && (
            <Button onClick={startUpload} className="w-full mt-3 font-semibold text-xs h-9 cursor-pointer">
              Upload File
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
