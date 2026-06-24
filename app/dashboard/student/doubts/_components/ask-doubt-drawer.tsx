"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, ImageIcon, Loader2, Keyboard as KeyboardIcon, X as XIcon } from "lucide-react";
import { VisualMathTextEditor } from "@/app/dashboard/member/question-banks/_components/visual-math-text-editor";
import { KeymanOskPanel } from "@/app/dashboard/member/question-banks/_components/virtual-keyboard";
import { uploadFile } from "@/lib/upload-utils";
import { getImageUrl } from "./math-renderer";

interface AskDoubtDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eligibleSubjects: { id: string; name: string }[];
  onSubmit: (data: {
    type: "ACADEMIC" | "NON_ACADEMIC";
    subjectId?: string;
    title: string;
    description: string;
    imageUrl: string | null;
  }) => void;
  isPending: boolean;
}

export function AskDoubtDrawer({
  open,
  onOpenChange,
  eligibleSubjects,
  onSubmit,
  isPending,
}: AskDoubtDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [type, setType] = useState<"ACADEMIC" | "NON_ACADEMIC">("ACADEMIC");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Keyboard active field state
  const [activeField, setActiveField] = useState<{
    id: string;
    ref: HTMLTextAreaElement | HTMLInputElement | null;
  } | null>(null);
  const [keyboardMode, setKeyboardMode] = useState<"keyman" | null>(null);
  const [keymanLocale, setKeymanLocale] = useState("@hi");

  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setUploadError("File size exceeds 1MB limit");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPEG, JPG, and PNG images are allowed");
      return;
    }

    setUploadError("");
    setUploadingFile(true);

    try {
      const res = await uploadFile({ file });
      setImageUrl(res.publicUrl);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploadingFile(false);
    }
  };

  // Set hydration mount state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Setup Mathlive and KaTeX CSS resources when open
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    // Load Mathlive
    const configureMvk = () => {
      const MFE = (window as any).MathfieldElement;
      if (MFE) {
        MFE.sharedVirtualKeyboardTargetOrigin = window.origin;
        MFE.mathVirtualKeyboardPolicy = "auto";
      }
    };

    if (!(window as any).MathfieldElement && !document.querySelector("script[data-mathlive]")) {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/mathlive";
      s.async = true;
      s.setAttribute("data-mathlive", "1");
      s.onload = configureMvk;
      document.head.appendChild(s);
    } else {
      configureMvk();
    }

    // Load KaTeX CSS for Live previews inside editor
    if (!document.getElementById("katex-css")) {
      const link = document.createElement("link");
      link.id = "katex-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
      document.head.appendChild(link);
    }
  }, [open]);

  // Close math virtual keyboard when closed
  useEffect(() => {
    if (!open) {
      setKeyboardMode(null);
      setActiveField(null);
      if (typeof window !== "undefined" && (window as any).mathVirtualKeyboard) {
        try {
          (window as any).mathVirtualKeyboard.hide();
        } catch (e) {}
      }
    }
  }, [open]);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      type,
      subjectId: type === "ACADEMIC" ? subjectId || undefined : undefined,
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || null,
    });
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end">
      <div className="w-full h-[90vh] sm:max-w-4xl sm:mx-auto bg-white dark:bg-slate-950 flex flex-col shadow-2xl overflow-hidden rounded-t-2xl border-t border-slate-200 dark:border-slate-800 transition-all duration-300">
        
        {/* Header */}
        <div className="shrink-0 p-4 pb-3 border-b border-slate-100 dark:border-slate-850 flex flex-row items-center justify-between select-none">
          <div>
            <h2 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span>Submit Doubt Query</span>
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Formulate your doubts using visual math and language keyboards.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Workspace */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <form onSubmit={handleSubmitForm} className="space-y-4 pt-2 pb-6">
            {/* Classification switch */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Query Classification
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={type === "ACADEMIC" ? "default" : "outline"}
                  onClick={() => {
                    setType("ACADEMIC");
                    setSubjectId("");
                  }}
                  className="h-10 text-xs rounded-xl font-bold cursor-pointer"
                >
                  Academic Doubt
                </Button>
                <Button
                  type="button"
                  variant={type === "NON_ACADEMIC" ? "default" : "outline"}
                  onClick={() => {
                    setType("NON_ACADEMIC");
                    setSubjectId("");
                  }}
                  className="h-10 text-xs rounded-xl font-bold cursor-pointer"
                >
                  Non-Academic Support
                </Button>
              </div>
            </div>

            {/* Target subject dropdown */}
            {type === "ACADEMIC" && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Target Subject
                </Label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="">Select a subject...</option>
                  {eligibleSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Headline */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Headline Summary
              </Label>
              <Input
                ref={titleInputRef}
                onFocus={() => setActiveField({ id: "student-doubt-title", ref: titleInputRef.current })}
                type="text"
                placeholder="e.g., Struggling to isolate variables in trigonometry"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                required
                maxLength={255}
                className="rounded-xl px-3.5 py-2 text-xs"
              />
            </div>

            {/* Elaboration visual math text editor */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Doubt Description & Math Formula
              </Label>
              <VisualMathTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Type details here. Use math editor for formulas..."
                fieldId="student-doubt-description"
                onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
              />
            </div>

            {/* Solutions Image Upload */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 select-none">
                <ImageIcon className="h-3.5 w-3.5 text-indigo-500" />
                <span>Attachment Image (Optional)</span>
              </Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="doubt-file-upload"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploadingFile}
                />
                <label
                  htmlFor="doubt-file-upload"
                  className={`flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold text-slate-750 dark:text-slate-200 cursor-pointer transition-colors ${
                    uploadingFile ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                      <span>Upload Image (Max 1MB)</span>
                    </>
                  )}
                </label>

                {imageUrl && (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 h-10 w-10 flex items-center justify-center shrink-0">
                    <img
                      src={getImageUrl(imageUrl)}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      title="Remove attachment"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {uploadError && (
                <p className="text-[10px] font-bold text-rose-500 mt-1 select-none">
                  {uploadError}
                </p>
              )}
            </div>

            {/* Integrated On-Screen Keyboard */}
            {keyboardMode === "keyman" && (
              <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between select-none">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <KeyboardIcon className="h-3.5 w-3.5 text-indigo-500" />
                    <span>On-Screen Language Keyboard</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setKeyboardMode(null)}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    ✕ Close
                  </button>
                </div>
                <KeymanOskPanel
                  activeField={activeField}
                  selectedLocale={keymanLocale}
                  onLocaleChange={setKeymanLocale}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Keyboard trigger */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (typeof window !== "undefined" && (window as any).mathVirtualKeyboard) {
                    (window as any).mathVirtualKeyboard.hide();
                  }
                  setKeyboardMode((prev) => (prev === "keyman" ? null : "keyman"));
                }}
                className={`h-8 px-3 font-bold text-[10px] gap-1.5 rounded-xl border transition-all ${
                  keyboardMode === "keyman"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                    : "bg-white hover:bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800"
                }`}
              >
                <KeyboardIcon className="h-3.5 w-3.5" />
                <span>Keyboard</span>
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl text-xs h-9 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || (type === "ACADEMIC" && !subjectId)}
                  className="rounded-xl text-xs h-9 cursor-pointer font-bold"
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  Submit Query
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
