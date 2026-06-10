"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Video,
  Download,
  AlertCircle,
  Loader2,
  ExternalLink,
  Calendar,
  Layers,
  Database,
  Play,
  Maximize,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberHeader } from "../../../layout";
import { useSharedAssetDetailQuery } from "../../_queries/media.queries";

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

export default function SharedMediaViewPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.assetId as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hlsLoaded, setHlsLoaded] = useState(false);

  // Fetch shared media details
  const { data: response, isLoading, error } = useSharedAssetDetailQuery(assetId);
  const asset = response?.data;

  // Construct the absolute secure streaming url from backend proxy
  const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const streamUrl = asset && asset.url
    ? (asset.url.startsWith("http") ? asset.url : `${baseApiUrl}${asset.url}`)
    : "";

  const downloadUrl = streamUrl ? `${streamUrl}?download=true` : "";

  // Dynamically load HLS.js from CDN if it's a VOD video and not native supported
  useEffect(() => {
    if (!asset || asset.type !== "VOD") return;

    const loadHls = () => {
      if ((window as any).Hls) {
        setHlsLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "hls-js";
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.4.12/dist/hls.min.js";
      script.onload = () => {
        setHlsLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadHls();
  }, [asset]);

  // Bind HLS stream to video tag
  useEffect(() => {
    if (!asset || asset.type !== "VOD" || !videoRef.current || !streamUrl) return;

    const video = videoRef.current;

    // Check if the source is HLS (.m3u8)
    const isHlsUrl = streamUrl.includes(".m3u8");

    if (isHlsUrl && hlsLoaded && (window as any).Hls) {
      const HlsClass = (window as any).Hls;
      if (HlsClass.isSupported()) {
        const hls = new HlsClass({
          maxMaxBufferLength: 10,
          enableWorker: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return () => {
          hls.destroy();
        };
      }
    }

    // Fallback/direct URL load (standard formats or Safari native HLS)
    video.src = streamUrl;
  }, [asset, hlsLoaded, streamUrl]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-semibold">Loading media asset preview...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Media Asset Not Accessible
        </h3>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          This note or video lecture is private, or you do not have permission to preview it.
        </p>
        <Button size="sm" onClick={() => router.back()} className="gap-1.5 text-xs font-semibold">
          <ArrowLeft className="h-3.5 w-3.5" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <MemberHeader>
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
              <button
                onClick={() => router.back()}
                className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" /> BACK
              </button>
              <span className="text-muted-foreground/30">/</span>
              <span className="text-primary/90">Preview Shared Asset</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground select-none mt-0.5 flex items-center gap-2">
              {asset.name}
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-wider">
                Preview Mode
              </span>
            </h1>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="h-9 px-3.5 text-xs gap-1.5 font-semibold border-slate-200 dark:border-slate-800 hover:bg-muted/10 rounded-lg cursor-pointer bg-white dark:bg-slate-900"
            >
              Return
            </Button>
          </div>
        </div>
      </MemberHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Media Player / Display Box */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video lg:aspect-auto lg:h-[520px] bg-slate-950 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-850 flex items-center justify-center">
            {asset.type === "NOTE" ? (
              <div className="w-full h-full relative flex flex-col bg-slate-900">
                {/* Embed PDF with secure presigned GET link */}
                <iframe
                  src={`${streamUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-0 rounded-2xl"
                  title={asset.name}
                />
                <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                  <a href={streamUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Fullscreen Preview
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              // Video Lecture Player (Custom Glassmorphic Wrapper)
              <div className="relative w-full h-full group">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  autoPlay
                />
              </div>
            )}
          </div>
        </div>

        {/* Details and Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              Asset Attributes
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {asset.type === "NOTE" ? <FileText className="h-4.5 w-4.5" /> : <Video className="h-4.5 w-4.5" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Resource Type</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                    {asset.type === "NOTE" ? "Study PDF Document" : "Recorded Video Lecture"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Attached Subject</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 truncate">
                    {asset.subjectName || "Core Subjects"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Database className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Storage Size</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                    {formatBytes(asset.sizeBytes)}
                  </span>
                </div>
              </div>

              {asset.type === "VOD" && asset.durationSeconds && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Play className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Lecture Duration</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      {formatDuration(asset.durationSeconds)} mins
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Published On</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                    {new Date(asset.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
