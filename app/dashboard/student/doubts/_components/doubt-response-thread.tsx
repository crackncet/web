"use client";

import React, { useEffect } from "react";
import { MessageSquare } from "lucide-react";

import { MathRenderer, getImageUrl } from "./math-renderer";

interface Reply {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  sender: {
    fullName: string;
    globalRole?: string;
  };
}

interface DoubtResponseThreadProps {
  replies: Reply[];
}

export function DoubtResponseThread({ replies }: DoubtResponseThreadProps) {
  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest px-1 select-none">
        <MessageSquare className="h-3.5 w-3.5 text-primary" />
        <span>Discussion ({replies.length})</span>
        <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1 ml-1" />
      </div>

      {/* Bubble list */}
      <div className="space-y-3">
        {replies.map((reply) => {
          const isTeacher = reply.sender.globalRole !== "STUDENT";
          return (
            <div
              key={reply.id}
              className={`flex flex-col max-w-[85%] rounded-xl p-4 border shadow-2xs ${
                isTeacher
                  ? "mr-auto bg-slate-50/50 dark:bg-slate-900 border-slate-150 dark:border-slate-800"
                  : "ml-auto bg-primary/5 border-primary/20"
              }`}
            >
              <div className="flex items-center gap-1.5 justify-between select-none">
                <span className="font-bold text-xs text-foreground truncate max-w-[120px]">
                  {reply.sender.fullName}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-muted border border-border text-[9px] text-muted-foreground font-semibold uppercase tracking-wider shrink-0">
                  {isTeacher ? "Instructor" : "Student"}
                </span>
              </div>
              <MathRenderer
                text={reply.content}
                className="text-xs text-slate-750 dark:text-slate-350 mt-2 whitespace-pre-wrap leading-relaxed font-mono break-words"
              />
              {reply.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-150 dark:border-slate-800 bg-background p-1 max-h-[220px] flex items-center justify-center">
                  <img
                    src={getImageUrl(reply.imageUrl)}
                    alt="Reply attachment screenshot"
                    className="max-h-[220px] w-auto object-contain mx-auto"
                  />
                </div>
              )}
              <span className="text-[9px] text-muted-foreground self-end mt-2 select-none">
                {new Date(reply.createdAt).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          );
        })}
        {replies.length === 0 && (
          <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground italic bg-muted/10 select-none">
            No messages posted yet.
          </div>
        )}
      </div>
    </div>
  );
}
