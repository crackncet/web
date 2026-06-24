"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Loader2, Send, Keyboard as KeyboardIcon } from "lucide-react";
import { VisualMathTextEditor } from "@/app/dashboard/member/question-banks/_components/visual-math-text-editor";
import { KeymanOskPanel } from "@/app/dashboard/member/question-banks/_components/virtual-keyboard";
import { uploadFile } from "@/lib/upload-utils";
import { getImageUrl } from "./math-renderer";
import { X as XIcon } from "lucide-react";

interface DoubtReplyFormProps {
  onSubmit: (data: { content: string; imageUrl: string | null }) => void;
  isPending: boolean;
}

export function DoubtReplyForm({ onSubmit, isPending }: DoubtReplyFormProps) {
  const [content, setContent] = useState("");
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

  // Setup Mathlive and KaTeX resources for the reply visual editor
  useEffect(() => {
    if (typeof window === "undefined") return;

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

    if (!document.getElementById("katex-css")) {
      const link = document.createElement("link");
      link.id = "katex-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
      document.head.appendChild(link);
    }
  }, []);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit({
      content: content.trim(),
      imageUrl: imageUrl.trim() || null,
    });
    setContent("");
    setImageUrl("");
  };

  return (
    <form onSubmit={handlePost} className="space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-4">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Compose Message
        </Label>
        <VisualMathTextEditor
          value={content}
          onChange={setContent}
          placeholder="Type your explanation or follow-up response here..."
          fieldId="doubt-reply-content"
          onFocusField={(id, _setter, ref) => setActiveField({ id, ref })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
          <ImageIcon className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
          <span>Attachment Image (Optional)</span>
        </Label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="reply-file-upload"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploadingFile}
          />
          <label
            htmlFor="reply-file-upload"
            className={`flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors ${
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

      {/* Collapsible Keyman Language Keyboard */}
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

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-1">
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

        <Button
          type="submit"
          disabled={isPending || !content.trim()}
          className="h-8 px-4 font-bold text-xs gap-1.5 rounded-xl cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <span>Send Message</span>
              <Send className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
