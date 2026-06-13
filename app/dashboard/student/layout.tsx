"use client";

import React, { createContext, useContext, useState } from "react";
import { AppSidebar } from "@/app/dashboard/student/_components/student-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

interface StudentLayoutContextType {
  setHeaderContent: (content: React.ReactNode) => void;
}

const StudentLayoutContext = createContext<StudentLayoutContextType | null>(null);

export function useStudentLayout() {
  const ctx = useContext(StudentLayoutContext);
  if (!ctx) {
    throw new Error("useStudentLayout must be used inside UserDashboardLayout");
  }
  return ctx;
}

// Client helper component that pages can render to mount content in the top bar header
export function StudentHeader({ children }: { children: React.ReactNode }) {
  const { setHeaderContent } = useStudentLayout();
  React.useEffect(() => {
    setHeaderContent(children);
    return () => setHeaderContent(null);
  }, [children, setHeaderContent]);
  return null;
}

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerContent, setHeaderContent] = useState<React.ReactNode>(null);

  return (
    <StudentLayoutContext.Provider value={{ setHeaderContent }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col bg-muted/40">
          {/* Unified top bar header */}
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-6 transition-all duration-200">
            <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
            
            <div className="flex-1 flex items-center justify-between">
              {headerContent}
            </div>
          </header>
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </StudentLayoutContext.Provider>
  );
}