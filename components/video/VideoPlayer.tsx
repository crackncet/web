"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertTriangle, Maximize, Play, Pause, Volume2, VolumeX, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

interface VideoPlayerProps {
  assetId: string;
  poster?: string;
  className?: string;
  showWatermark?: boolean;
  demoUrl?: string; // used for public demo videos bypassing proxy auth
  streamUrl?: string; // pre-computed authenticated stream URL from parent
}

export function VideoPlayer({
  assetId,
  poster,
  className = "",
  showWatermark = false,
  demoUrl,
  streamUrl,
}: VideoPlayerProps) {
  const { data: user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [securityViolation, setSecurityViolation] = useState(false);
  const [qualities, setQualities] = useState<{ id: number; height: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);

  const email = user?.email || "student@crackncet.com";

  // Keep native playback speed in sync with state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlaybackRate = () => {
      if (video.playbackRate !== playbackSpeed) {
        video.playbackRate = playbackSpeed;
      }
    };

    video.addEventListener("play", syncPlaybackRate);
    video.addEventListener("ratechange", syncPlaybackRate);
    
    // Apply speed immediately
    video.playbackRate = playbackSpeed;

    return () => {
      video.removeEventListener("play", syncPlaybackRate);
      video.removeEventListener("ratechange", syncPlaybackRate);
    };
  }, [playbackSpeed]);

  // 1. Initialize Video Stream (HLS or Native)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Stream URL
    const finalStreamUrl = streamUrl || demoUrl || `${process.env.NEXT_PUBLIC_API_URL || ""}/library/mediaAssets/shared/${assetId}/stream`;

    let hls: Hls | null = null;
    setIsLoading(true);

    // Sync playing/paused/metadata states
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onSeeking = () => setIsLoading(true);
    const onSeeked = () => setIsLoading(false);
    const onCanPlay = () => setIsLoading(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("durationchange", onLoadedMetadata);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("canplay", onCanPlay);

    const extractTokenFromUrl = (urlStr: string): string => {
      try {
        const parsed = new URL(urlStr);
        return parsed.searchParams.get("token") || "";
      } catch (e) {
        const match = urlStr.match(/[?&]token=([^&]+)/);
        return match ? match[1] : "";
      }
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        xhrSetup: (xhr, url) => {
          // Only send credentials if the request is to our own backend proxy API
          const isOwnApi = process.env.NEXT_PUBLIC_API_URL 
            ? url.includes(process.env.NEXT_PUBLIC_API_URL) 
            : url.includes("/api");
          
          if (isOwnApi) {
            xhr.withCredentials = true; // Ensures the session cookie is forwarded
          }
          
          // Rewrite relative segment paths to use Backend Proxy with ?file= query parameter
          const searchStr = `/shared/${assetId}/`;
          const index = url.indexOf(searchStr);
          if (index !== -1 && !url.includes("stream?file=")) {
            const subpath = url.substring(index + searchStr.length);
            if (subpath) {
              try {
                // Separate query parameters from the path
                const parts = subpath.split("?");
                const filePath = parts[0];
                
                // Only rewrite if we are requesting a relative file segment, NOT the stream endpoint itself!
                if (filePath && filePath !== "stream") {
                  const urlToken = parts[1] ? new URLSearchParams(parts[1]).get("token") : null;
                  const tokenToUse = urlToken || extractTokenFromUrl(finalStreamUrl);
                  
                  const queryStr = tokenToUse ? `?token=${tokenToUse}` : "";
                  const separator = queryStr ? "&" : "?";
                  const newUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}/library/mediaAssets/shared/${assetId}/stream${queryStr}${separator}file=${encodeURIComponent(filePath)}`;
                  xhr.open("GET", newUrl, true);
                }
              } catch (e) {
                // fallback
              }
            }
          }

          // Rewrite general media/access relative segment paths
          const mediaSearchStr = "/media/";
          const mediaIndex = url.indexOf(mediaSearchStr);
          if (mediaIndex !== -1 && !url.includes("media/access?file=")) {
            const subpath = url.substring(mediaIndex + mediaSearchStr.length);
            if (subpath) {
              try {
                const parts = subpath.split("?");
                const filePath = parts[0];
                if (filePath && filePath !== "access") {
                  const urlToken = parts[1] ? new URLSearchParams(parts[1]).get("token") : null;
                  const tokenToUse = urlToken || extractTokenFromUrl(finalStreamUrl);
                  
                  const queryStr = tokenToUse ? `?token=${tokenToUse}` : "";
                  const separator = queryStr ? "&" : "?";
                  const newUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}/media/access${queryStr}${separator}file=${encodeURIComponent(filePath)}`;
                  xhr.open("GET", newUrl, true);
                }
              } catch (e) {
                // fallback
              }
            }
          }
        },
      });

      hls.loadSource(finalStreamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const mappedQualities = data.levels.map((level, idx) => ({
          id: idx,
          height: level.height,
        }));
        setQualities(mappedQualities);
      });

      setHlsInstance(hls);
    } else if (video.canPlayType("application/vnd.apple.mime.type")) {
      // Native HLS support (Safari / iOS)
      video.src = finalStreamUrl;
    }

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("durationchange", onLoadedMetadata);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("canplay", onCanPlay);
      if (hls) {
        hls.destroy();
      }
    };
  }, [assetId, demoUrl, streamUrl]);

  const togglePlay = () => {
    if (securityViolation) return;
    const video = videoRef.current;
    if (!video) return;

    setShowSettings(false);
    setShowSpeedMenu(false);

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    if (video.muted) {
      video.volume = 0;
    } else {
      video.volume = volume;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      video.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    const video = videoRef.current;
    if (video) {
      video.currentTime = newTime;
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen().catch(() => {});
    }
  };

  const changeQuality = (levelId: number) => {
    if (!hlsInstance) return;
    hlsInstance.currentLevel = levelId;
    setCurrentQuality(levelId);
    setShowSettings(false);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    
    if (hours > 0) {
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    }
    return `${minutes}:${formattedSeconds}`;
  };

  // 3. Canvas Watermark Loop
  useEffect(() => {
    if (!showWatermark || securityViolation) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let x = Math.random() * 200;
    let y = Math.random() * 200;
    let dx = 0.5 + Math.random() * 0.5;
    let dy = 0.5 + Math.random() * 0.5;

    const render = () => {
      if (canvas.width !== video.clientWidth || canvas.height !== video.clientHeight) {
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Bounce coordinates off walls
      x += dx;
      y += dy;

      if (x <= 10 || x >= canvas.width - 200) dx = -dx;
      if (y <= 20 || y >= canvas.height - 20) dy = -dy;

      // Draw dynamic watermark text - High contrast readable style (white text with dark outline)
      ctx.save();
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 3.5;
      ctx.lineJoin = "round";
      ctx.strokeText(email, x, y);
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillText(email, x, y);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [showWatermark, email, securityViolation]);

  // 4. Tamper Protection (MutationObserver & Periodic Active Visual Check)
  useEffect(() => {
    if (!showWatermark || securityViolation) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!container || !canvas || !video) return;

    const triggerViolation = () => {
      setSecurityViolation(true);
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    // A. Active Visual State Checks
    const checkSecurity = () => {
      if (!showWatermark || securityViolation) return;

      // Ensure elements are still in the DOM and correct hierarchy
      if (!canvasRef.current || !containerRef.current || !videoRef.current) {
        triggerViolation();
        return;
      }
      if (!containerRef.current.contains(canvasRef.current)) {
        triggerViolation();
        return;
      }

      // Read computed styles to detect any stylesheet/devtools rules
      const style = window.getComputedStyle(canvasRef.current);
      const opacity = parseFloat(style.opacity || "1");
      const zIndex = parseInt(style.zIndex || "0", 10);
      
      const videoStyle = window.getComputedStyle(videoRef.current);
      const videoZIndex = parseInt(videoStyle.zIndex || "0", 10);

      // The canvas element must have display: block (or inline), be visible, and have 100% opacity
      // Note: Watermark opacity is handled inside the canvas drawing, the canvas node itself must be opaque (opacity >= 0.95)
      const isHidden =
        style.display === "none" ||
        style.visibility === "hidden" ||
        opacity < 0.95 ||
        style.pointerEvents !== "none" ||
        style.position !== "absolute";

      // Transform scales or translations offscreen
      const transform = style.transform;
      const isTransformed =
        transform.includes("scale(0") ||
        transform.includes("matrix(0") ||
        transform.includes("translate");

      // Margins / positioning values used to push it offscreen
      const topVal = parseFloat(style.top || "0");
      const leftVal = parseFloat(style.left || "0");
      const isMovedOffscreen = Math.abs(topVal) > 10 || Math.abs(leftVal) > 10;

      // Z-Index check - canvas must always sit above the video tag
      const isUnderVideo = zIndex <= videoZIndex;

      // Dimension checks (resizing to 0x0)
      const isScaledDown = canvasRef.current.clientWidth < 100 || canvasRef.current.clientHeight < 50;

      if (isHidden || isTransformed || isMovedOffscreen || isUnderVideo || isScaledDown) {
        triggerViolation();
      }
    };

    // B. DOM Mutation Observer
    const observer = new MutationObserver((mutations) => {
      let violated = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const canvasRemoved = Array.from(mutation.removedNodes).some(
            (node) => node === canvas || (node instanceof HTMLElement && node.id === "watermark-canvas")
          );
          if (canvasRemoved) violated = true;
        }
        if (mutation.type === "attributes" && mutation.target === canvas) {
          const style = window.getComputedStyle(canvas);
          const opacity = parseFloat(style.opacity || "1");
          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            opacity < 0.95 ||
            style.pointerEvents !== "none"
          ) {
            violated = true;
          }
        }
      }
      if (violated) {
        triggerViolation();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "hidden"],
    });

    // Run active check immediately and then every 300ms
    checkSecurity();
    const intervalId = setInterval(checkSecurity, 300);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [showWatermark, securityViolation]);

  return (
    <div
      ref={containerRef}
      className={`relative group overflow-hidden rounded-xl bg-black aspect-video select-none border border-border/10 ${className}`}
    >
      {/* Actual HTML5 video tag */}
      <video
        ref={videoRef}
        poster={poster}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Loading Spinner */}
      {isLoading && !securityViolation && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 pointer-events-none transition-all duration-300">
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring */}
            <span className="absolute inline-flex h-16 w-16 rounded-full bg-white/10 animate-ping" />
            <Loader2 className="h-10 w-10 text-white animate-spin relative z-10" />
          </div>
        </div>
      )}

      {/* Transparent Watermark canvas overlay */}
      {showWatermark && !securityViolation && (
        <canvas
          id="watermark-canvas"
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
          style={{ opacity: 1, display: "block", visibility: "visible" }}
        />
      )}

      {/* Security Violation Screen */}
      {securityViolation && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mb-3 animate-bounce" />
          <h3 className="text-sm font-bold text-white tracking-tight">Security Tamper Detected</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
            Modifying or deleting the security watermark in Developer Tools is strictly prohibited. 
            Playback has been suspended. Please refresh the page to restore access.
          </p>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
            className="mt-4 text-xs font-semibold"
          >
            Refresh Page
          </Button>
        </div>
      )}

      {/* Controls Overlay */}
      {!securityViolation && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 z-20 pointer-events-none">
          
          {/* Progress / Seek bar */}
          <div className="w-full pointer-events-auto flex items-center gap-3 mb-2.5">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 hover:h-1.5 transition-all duration-150 rounded-lg appearance-none cursor-pointer outline-none bg-white/20 accent-violet-650"
              style={{
                background: `linear-gradient(to right, rgb(124, 58, 237) 0%, rgb(124, 58, 237) ${
                  duration ? (currentTime / duration) * 100 : 0
                }%, rgba(255, 255, 255, 0.2) ${
                  duration ? (currentTime / duration) * 100 : 0
                }%, rgba(255, 255, 255, 0.2) 100%)`,
              }}
            />
            <span className="text-[10px] text-white/90 font-semibold tabular-nums shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Bottom control bar */}
          <div className="flex items-center justify-between pointer-events-auto relative w-full">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10 rounded-lg cursor-pointer"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              </Button>
              
              {/* Volume Controller with voice scroller */}
              <div className="flex items-center gap-1.5 group/volume">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10 rounded-lg cursor-pointer"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 opacity-0 pointer-events-none group-hover/volume:w-16 group-hover/volume:opacity-100 group-hover/volume:pointer-events-auto transition-all duration-300 h-1 accent-violet-600 bg-white/30 rounded-lg appearance-none cursor-pointer outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Playback Speed selector */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-white hover:bg-white/10 rounded-lg cursor-pointer text-xs font-bold font-mono"
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowSettings(false);
                  }}
                >
                  {playbackSpeed}x
                </Button>
                {showSpeedMenu && (
                  <div className="absolute right-0 bottom-10 bg-black/90 border border-white/10 rounded-xl p-2 w-24 text-xs text-white flex flex-col gap-1 shadow-lg z-30">
                    <span className="font-bold border-b border-white/10 pb-1 text-[10px] text-muted-foreground uppercase tracking-wider select-none">Speed</span>
                    {[1, 1.5, 2, 2.5].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setShowSpeedMenu(false);
                        }}
                        className={`text-left px-1.5 py-1 rounded hover:bg-white/10 transition font-mono ${
                          playbackSpeed === speed ? "text-violet-400 font-bold" : ""
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings Quality selector */}
              {qualities.length > 0 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/10 rounded-lg cursor-pointer"
                    onClick={() => {
                      setShowSettings(!showSettings);
                      setShowSpeedMenu(false);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  {showSettings && (
                    <div className="absolute right-0 bottom-10 bg-black/90 border border-white/10 rounded-xl p-2 w-28 text-xs text-white flex flex-col gap-1.5 shadow-lg z-30">
                      <span className="font-bold border-b border-white/10 pb-1 text-[10px] text-muted-foreground uppercase tracking-wider select-none">Quality</span>
                      <button
                        type="button"
                        onClick={() => changeQuality(-1)}
                        className={`text-left px-1.5 py-1 rounded hover:bg-white/10 transition ${currentQuality === -1 ? "text-violet-400 font-bold" : ""}`}
                      >
                        Auto
                      </button>
                      {qualities.map((q) => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => changeQuality(q.id)}
                          className={`text-left px-1.5 py-1 rounded hover:bg-white/10 transition ${currentQuality === q.id ? "text-violet-400 font-bold" : ""}`}
                        >
                          {q.height}p
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10 rounded-lg cursor-pointer"
                onClick={handleFullscreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
