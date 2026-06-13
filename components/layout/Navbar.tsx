'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Loader2, 
  Home, 
  GraduationCap, 
  Trophy, 
  Info, 
  LogIn, 
  ChevronDown, 
  CheckSquare 
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import LoginDailog from "../dialogs/LoginDialog";
import SignupDialog from "../dialogs/SignupDialog";
import { useUser, useLogout } from "@/hooks/use-user";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Courses", href: "/courses", icon: GraduationCap },
  { label: "Test Series", href: "/test-series", icon: CheckSquare },
  { label: "Results", href: "/results", icon: Trophy },
  { label: "About NCET", href: "/about-ncet", icon: Info }
];

function AuthFallback() {
  return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
}

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

// ─── Desktop Auth Section ──────────────────────────────────────────────────
function AuthSection() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: (message) => toast.success(message),
      onError: (error) => toast.error(error.message),
    });
  };

  if (!mounted || isLoading) {
    return <AuthFallback />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        {/* Dashboard Button (Outlined with violet border, violet text) */}
        <Link href="/dashboard" aria-label="Dashboard">
          <Button 
            variant="ghost" 
            size="default" 
            className="border border-violet-200 dark:border-violet-850 hover:border-violet-500 text-violet-650 dark:text-violet-400 bg-transparent hover:bg-violet-50/50 dark:hover:bg-violet-950/20 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 h-9 px-4 cursor-pointer transition-all shadow-2xs"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
        </Link>
        
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 pr-2 rounded-full border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-450 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center text-white text-xs font-black shadow-inner select-none">
                {getInitials(user.fullName)}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-250 px-1 select-none">
                {user.fullName?.split(" ")[0]}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 p-1.5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-lg z-50">
            <DropdownMenuLabel className="font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider p-2 select-none">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 border-t border-slate-100 dark:border-slate-850" />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-705 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all">
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 border-t border-slate-100 dark:border-slate-850" />
            <DropdownMenuItem 
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/15 cursor-pointer transition-all"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <LoginDailog trigger={
        <Button variant="ghost" className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-350 hover:text-violet-650 dark:hover:text-violet-400">
          Login
        </Button>
      } />
      <SignupDialog trigger={
        <Button variant="default" className="bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-5">
          Sign Up
        </Button>
      } />
    </div>
  );
}

// ─── Mobile Drawer Section ─────────────────────────────────────────────────
function MobileNav() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthLoading = !mounted || isLoading;

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: (message) => {
        toast.success(message);
        setOpen(false);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  if (isAuthLoading) {
    return <AuthFallback />;
  }

  return (
    <div className="flex items-center gap-2 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {user ? (
            /* Logged-in state trigger: Avatar with Chevron [A v] */
            <button className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all cursor-pointer">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
                {getInitials(user.fullName)}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 mr-0.5" />
            </button>
          ) : (
            /* Guest state trigger: Hamburger Menu button [☰] */
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4 text-slate-700 dark:text-slate-200" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col h-full w-[290px] p-5 border-l border-slate-100 dark:border-slate-900 z-50">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center">
              <Image
                src="/logo-light.png"
                alt="CrackNCET Logo"
                width={28}
                height={28}
                priority
              />
            </Link>
          </div>

          {/* User Profile Card if logged in */}
          {user && (
            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center text-white text-sm font-black shadow-inner">
                {getInitials(user.fullName)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">
                  {user.fullName}
                </span>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )}

          {/* Links list */}
          <div className="flex flex-col gap-2 py-4 flex-1 overflow-y-auto">
            {/* If logged in, Dashboard is first item in the list */}
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  pathname.startsWith("/dashboard")
                    ? "bg-violet-50 text-violet-600 dark:bg-violet-955/35 dark:text-violet-400"
                    : "text-slate-605 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Dashboard</span>
              </Link>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive
                      ? "bg-violet-50 text-violet-600 dark:bg-violet-955/35 dark:text-violet-400"
                      : "text-slate-605 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom actions */}
          <div className="border-t border-slate-100 dark:border-slate-805/80 pt-4">
            {user ? (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full h-11 flex items-center justify-center gap-2 font-bold text-sm bg-red-50 dark:bg-red-955/15 hover:bg-red-100 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100/80 dark:border-red-900/35 rounded-xl cursor-pointer transition-colors"
              >
                {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2.5">
                <LoginDailog trigger={
                  <button onClick={() => setOpen(false)} className="w-full h-10 flex items-center justify-center font-bold text-xs uppercase tracking-wider text-slate-750 dark:text-slate-300 hover:text-violet-650 dark:hover:text-violet-400 cursor-pointer">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </button>
                } />
                <SignupDialog trigger={
                  <button onClick={() => setOpen(false)} className="w-full h-11 flex items-center justify-center font-bold text-xs uppercase tracking-wider bg-violet-600 hover:bg-violet-750 text-white rounded-xl cursor-pointer transition-all shadow-xs">
                    Sign Up
                  </button>
                } />
              </div>
            )}
          </div>

        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────────────
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    // Initial check
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        "bg-[#f8fafc] dark:bg-[#070b14]" 
    }`}>
      <nav className="mx-auto flex w-full max-w-9xl items-center justify-between px-4 py-3 md:px-10">
        
        {/* Left Section: Logo & Nav Links */}
        <div className="flex items-center gap-6 md:gap-8">
          {/* Logo (size of icon with a bit of padding) */}
          <Link href="/" className="flex items-center justify-center p-1.5 hover:opacity-90 transition-opacity">
            <Image
              src="/logo-light.png"
              alt="CrackNCET Logo"
              width={32}
              height={32}
              priority
              className="object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center">
            <NavigationMenu className="w-full justify-start" viewport={false}>
              <NavigationMenuList className="justify-start gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuLink asChild>
                        <Link 
                          href={item.href}
                          className={`group inline-flex h-9 w-max items-center justify-center rounded-xl px-4 py-2 text-sm  transition-all ${
                            isActive
                              ? "bg-violet-50 text-violet-600 dark:bg-violet-955/35 dark:text-violet-400"
                              : "text-slate-655 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Right Section: Auth & Mobile Nav */}
        <div className="flex items-center gap-3">
          <MobileNav />

          <div className="hidden md:flex">
            <Suspense fallback={<AuthFallback />}>
              <AuthSection />
            </Suspense>
          </div>
        </div>

      </nav>
    </header>
  );
}
