"use client";

import React, { useEffect, useRef, useState } from "react";

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "");
  return `${baseUrl}${path}`;
}

interface MathRendererProps {
  text: string;
  className?: string;
}

export function MathRenderer({ text, className = "" }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [katexLoaded, setKatexLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load CSS
    if (!document.getElementById("katex-css")) {
      const link = document.createElement("link");
      link.id = "katex-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
      document.head.appendChild(link);
    }

    // Load Scripts sequentially
    const loadScripts = async () => {
      if ((window as any).renderMathInElement) {
        setKatexLoaded(true);
        return;
      }

      const loadScript = (id: string, src: string) => {
        return new Promise<void>((resolve, reject) => {
          const existing = document.getElementById(id) as HTMLScriptElement | null;
          if (existing) {
            if ((window as any).renderMathInElement || (id === "katex-js" && (window as any).katex)) {
              resolve();
            } else {
              existing.addEventListener("load", () => resolve());
              existing.addEventListener("error", () => reject());
            }
            return;
          }

          const script = document.createElement("script");
          script.id = id;
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.head.appendChild(script);
        });
      };

      try {
        await loadScript("katex-js", "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js");
        await loadScript("katex-auto-render-js", "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js");
        setKatexLoaded(true);
      } catch (err) {
        console.error("Failed to load KaTeX", err);
      }
    };

    loadScripts();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.textContent = text;

    if (katexLoaded && (window as any).renderMathInElement) {
      try {
        (window as any).renderMathInElement(containerRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      } catch (e) {
        console.warn("KaTeX render error:", e);
      }
    }
  }, [text, katexLoaded]);

  return (
    <div ref={containerRef} className={className} style={{ wordBreak: "break-word" }} />
  );
}
