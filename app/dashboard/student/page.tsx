"use client";

import React, { useState } from "react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { StudentHeader } from "./layout";
import { Sparkles, Eye, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentDashboardPage() {
  const [showWatermark, setShowWatermark] = useState(true);

  // Mux public HLS test stream URL
  const testStreamUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <StudentHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <span className="font-extrabold text-slate-850 dark:text-white">Video Player Playground</span>
        </div>
      </StudentHeader>

      {/* Main Player Display */}
      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-violet-600" />
              Secure HLS Stream Sandbox
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Playing a public multi-bitrate HLS test stream via our custom `xhrSetup` rewriter.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Watermark:</span>
            <Button
              size="sm"
              variant={showWatermark ? "default" : "outline"}
              onClick={() => setShowWatermark(!showWatermark)}
              className="font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              {showWatermark ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </div>

        <div className="p-6 bg-slate-950">
          <VideoPlayer
            assetId="test-hls-asset"
            demoUrl={testStreamUrl}
            showWatermark={showWatermark}
            className="w-full rounded-xl shadow-lg border border-white/10"
          />
        </div>
      </div>

      {/* Testing Instructions & Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Key HLS Features to Inspect
          </h3>
          <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-350">
            <li className="flex items-start gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600 mt-1.5 shrink-0" />
              <span>
                <strong>Adaptive Bitrate:</strong> Open settings (gear icon) on hover to see and select different available video resolutions (e.g. 360p, 480p, 720p).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600 mt-1.5 shrink-0" />
              <span>
                <strong>Floating Watermark:</strong> Observe your email (or fallback text) moving randomly across the video canvas overlay with 15% opacity.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600 mt-1.5 shrink-0" />
              <span>
                <strong>Autoplay & Fullscreen:</strong> Custom skin controls support seamless play/pause, volume adjustment, and full-screen switching.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500 animate-pulse" />
            How to Test Anti-Tampering
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            Verify the DevTools protection mechanisms by trying any of these inspect-element overrides:
          </p>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-350">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span>Right-click the video, inspect, and try to delete the <code>&lt;canvas id="watermark-canvas"&gt;</code> element.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span>Try modifying the inline styles to add <code>display: none</code> or <code>opacity: 0</code>.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span>See the player instantly lock down and display a security violation warning overlay.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}