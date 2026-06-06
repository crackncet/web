"use client";

import React, { createContext, useContext, useState } from "react";
import { MemberSidebar } from "@/app/dashboard/member/_components/member-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

interface MemberLayoutContextType {
  setHeaderContent: (content: React.ReactNode) => void;
}

const MemberLayoutContext = createContext<MemberLayoutContextType | null>(null);

export function useMemberLayout() {
  const ctx = useContext(MemberLayoutContext);
  if (!ctx) {
    throw new Error("useMemberLayout must be used inside MemberDashboardLayout");
  }
  return ctx;
}

// Client helper component that pages can render to mount content in the top bar header
export function MemberHeader({ children }: { children: React.ReactNode }) {
  const { setHeaderContent } = useMemberLayout();
  React.useEffect(() => {
    setHeaderContent(children);
    return () => setHeaderContent(null);
  }, [children, setHeaderContent]);
  return null;
}

export default function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerContent, setHeaderContent] = useState<React.ReactNode>(null);

  return (
    <MemberLayoutContext.Provider value={{ setHeaderContent }}>
      <SidebarProvider>
        <MemberSidebar />
        <SidebarInset className="flex flex-col bg-muted/40">
          {/* Unified top bar header */}
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-6 transition-all duration-200">
            <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
            
            <div className="flex-1 flex items-center justify-between">
              {headerContent}
            </div>
          </header>
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </MemberLayoutContext.Provider>
  );
}
