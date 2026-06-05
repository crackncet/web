"use client";

import { PrivateRoute } from "@/components/auth/proxy";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateRoute>{children}</PrivateRoute>;
}
