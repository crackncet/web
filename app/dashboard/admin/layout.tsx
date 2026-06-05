"use client";

import React, { createContext, useContext, useState } from "react";
import { AppSidebar } from "@/app/dashboard/admin/_components/admin-sidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface AdminLayoutContextType {
  setHeaderContent: (content: React.ReactNode) => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | null>(null);

export function useAdminLayout() {
  const ctx = useContext(AdminLayoutContext);
  if (!ctx) {
    throw new Error("useAdminLayout must be used inside AdminDashboardLayout");
  }
  return ctx;
}

// Client helper component that pages can render to mount content in the top bar header
export function AdminHeader({ children }: { children: React.ReactNode }) {
  const { setHeaderContent } = useAdminLayout();
  React.useEffect(() => {
    setHeaderContent(children);
    return () => setHeaderContent(null);
  }, [children, setHeaderContent]);
  return null;
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerContent, setHeaderContent] = useState<React.ReactNode>(null);

  return (
    <AdminLayoutContext.Provider value={{ setHeaderContent }}>
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
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminLayoutContext.Provider>
  );
}