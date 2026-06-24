"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Video,
  Database,
  User,
  LogOut,
  ChevronUp,
  MessageSquare,
} from "lucide-react";

import { useUser, useLogout } from "@/hooks/use-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export function MemberSidebar() {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const pathname = usePathname();
  const { state } = useSidebar();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
    });
  };

  const navGroups = [
    {
      label: "Dashboard",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/member",
          icon: LayoutDashboard,
        },
        ...(user?.isHod
          ? [
              {
                title: "Teachers",
                url: "/dashboard/member/teachers",
                icon: Users,
              },
            ]
          : []),
      ],
    },
    {
      label: "Academics",
      items: [
        {
          title: "Courses",
          url: "/dashboard/member/courses",
          icon: BookOpen,
        },
        {
          title: "Test Series",
          url: "/dashboard/member/test-series",
          icon: GraduationCap,
        },
        {
          title: "Doubt Queue",
          url: "/dashboard/member/doubts",
          icon: MessageSquare,
        },
      ],
    },
    {
      label: "Library",
      items: [
        {
          title: "Media",
          url: "/dashboard/member/media",
          icon: Video,
        },
        {
          title: "Question Banks",
          url: "/dashboard/member/question-banks",
          icon: Database,
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
      <SidebarHeader className={`h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 transition-all duration-200 ${state === "collapsed" ? "px-2" : "px-4"}`}>
        <Link href="/" className={`flex items-center gap-2 font-black text-lg tracking-tight w-full transition-all duration-200 ${state === "collapsed" ? "justify-center" : "justify-start"}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Image
              src="/logo-light.png"
              alt="CrackNCET Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          {state !== "collapsed" && (
            <span className="font-black text-slate-900 dark:text-slate-100 transition-all duration-300">
              CrackNCET
            </span>
          )}
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="py-4">
        {navGroups.map((group, groupIdx) => (
          <SidebarGroup key={groupIdx}>
            {state !== "collapsed" && (
              <SidebarGroupLabel className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={`transition-colors duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-slate-200 dark:border-slate-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full justify-start items-center hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors p-1.5"
                >
                  <div className="flex items-center gap-3 w-full">
                    {/* User Profile Avatar */}
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.fullName}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                        {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
                      </div>
                    )}
                    
                    {state !== "collapsed" && (
                      <div className="flex flex-col text-left overflow-hidden w-full">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate leading-tight">
                          {user?.fullName || "Team Member"}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-none">
                          {user?.email || "member@crackncet.com"}
                        </span>
                      </div>
                    )}
                    {state !== "collapsed" && (
                      <ChevronUp className="h-4 w-4 ml-auto text-slate-400 shrink-0" />
                    )}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent
                align="end"
                side="top"
                className="w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-2 p-2">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                      {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {user?.fullName || "Team Member"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {user?.email || "member@crackncet.com"}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/member/profile" className="flex items-center gap-2 w-full cursor-pointer">
                    <User className="h-4 w-4 text-slate-500" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
