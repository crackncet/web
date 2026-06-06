"use client";

import React from "react";
import { Database } from "lucide-react";
import { MemberHeader } from "../layout";

export default function QuestionBanksPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <MemberHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>LIBRARY</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Question Banks</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Question Banks
          </h1>
        </div>
      </MemberHeader>

      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="p-4 bg-purple-500/10 text-purple-500 rounded-full mb-4">
          <Database className="h-10 w-10" />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
          No Question Banks Compiled
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mt-2">
          Compile and import markdown format question pools. Use this module to setup your exam question papers.
        </p>
      </div>
    </div>
  );
}
