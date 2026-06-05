"use client";

import React, { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/app/dashboard/admin/layout";
import { ExamsSection } from "./_components/exams-section";
import { StreamsSection } from "./_components/streams-section";
import { Loader2 } from "lucide-react";

function SectionLoadingFallback({ label }: { label: string }) {
  return (
    <div className="flex flex-col">
      {/* Semantic Horizontal Bar Placeholder */}
      <div className="h-16 bg-secondary/70 border-b border-border flex items-center px-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/60" />
      </div>
      {/* Semantic Tabular Representation Placeholder */}
      <div className="flex flex-col items-center justify-center min-h-[320px] bg-card p-8">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm mt-2 font-medium">
          Loading {label}...
        </p>
      </div>
    </div>
  );
}

export default function MetadataDashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Portal Injection */}
      <AdminHeader>
        <div className="flex flex-col">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>Administration</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Metadata</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            Metadata Management
          </h1>
        </div>
      </AdminHeader>

      {/* Tabs Container */}
      <Tabs defaultValue="exams" className="w-full">
        {/* Folder-like tab list aligned left, not full width */}
        <div className="flex justify-start select-none relative z-10">
          <TabsList className="flex bg-transparent p-0 gap-1.5 h-auto rounded-none border-b-0">
            <TabsTrigger
              value="exams"
              className="px-6 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-t-xl border border-transparent bg-muted/20 data-[state=active]:border-border data-[state=active]:border-b-transparent data-[state=active]:bg-secondary/70 data-[state=active]:text-foreground relative z-20 -mb-[1px] shadow-none cursor-pointer transition-all duration-150"
            >
              Exams
            </TabsTrigger>
            <TabsTrigger
              value="streams"
              className="px-6 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-t-xl border border-transparent bg-muted/20 data-[state=active]:border-border data-[state=active]:border-b-transparent data-[state=active]:bg-secondary/70 data-[state=active]:text-foreground relative z-20 -mb-[1px] shadow-none cursor-pointer transition-all duration-150"
            >
              Streams
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Connected Solid Outer Card Container */}
        <div className="border border-border bg-card rounded-b-xl rounded-tr-xl shadow-xs overflow-hidden mt-0">
          {/* Exams Tab */}
          <TabsContent value="exams" className="outline-none mt-0">
            <Suspense fallback={<SectionLoadingFallback label="exams database" />}>
              <ExamsSection />
            </Suspense>
          </TabsContent>

          {/* Streams Tab */}
          <TabsContent value="streams" className="outline-none mt-0">
            <Suspense fallback={<SectionLoadingFallback label="streams database" />}>
              <StreamsSection />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}