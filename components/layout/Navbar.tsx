'use client';

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, LayoutDashboard, CircleUser, User, LogOut, Loader2} from "lucide-react";
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
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Test Series", href: "/test-series" },
  { label: "Results", href: "/results" },
];

function AuthFallback() {
  return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
}

// ─── Desktop Auth Section ──────────────────────────────────────────────────
function AuthSection() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: (message) => toast.success(message),
      onError: (error) => toast.error(error.message),
    });
  };

  if (isLoading) {
    return <AuthFallback />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/dashboard" aria-label="Dashboard">
          <Button variant="outline" size="default" className="text-primary">
            Dashboard
          </Button>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <CircleUser className="h-6 w-6 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <LoginDailog />
      <SignupDialog />
    </div>
  );
}

// ─── Mobile Drawer Section ─────────────────────────────────────────────────
function MobileNav() {
  const { data: user, isLoading } = useUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: (message) => {
        toast.success(message);
        setOpen(false);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="flex items-center gap-2 md:hidden">
      {/* Quick Dashboard Icon if Logged In (Left of Hamburger) */}
      {user && !isLoading && (
        <Link href="/dashboard" aria-label="Dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <LayoutDashboard className="h-5 w-5 text-foreground" />
          </Button>
        </Link>
      )}

      {/* Hamburger Menu -> Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col h-full w-[300px] sm:w-[350px]">
          <SheetHeader className="text-left">
            <Image
              src="/logo-light.png"
              alt="CrackNCET Logo"
              width={32}
              height={32}
              className="mr-2"
            />
          </SheetHeader>
          
          {/* Nav Links */}
          <div className="flex flex-col gap-4 py-6 flex-1 ml-5">
            <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase mb-1">
                Menu
                </p>
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Dashboard and Profile if logged in */}
            {user && !isLoading && (
              <div className="mt-6 pt-6 border-t border-border/40 mr-5 flex flex-col gap-4">
                <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase mb-1">
                  Welcome, {user.fullName?.split(' ')[0] || "User"}
                </p>
                <Link 
                  href="/dashboard" 
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors flex items-center"
                >
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors flex items-center"
                >
                  <User className="mr-3 h-5 w-5" />
                  My Profile
                </Link>
              </div>
            )}
          </div>

          {/* Bottom Auth Section */}
          <div className="flex justify-center items-center gap-3 py-10">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="min-w-[120px]"
              >
                {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                Logout
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <LoginDailog />
                <SignupDialog />
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
  return (
    <header className="w-full bg-background border-b border-border/40">
      <nav className="mx-auto grid w-full max-w-(--space-container-max) grid-cols-12 items-center gap-3 px-(--space-margin-mobile) py-(--space-stack-md) md:px-(--space-margin-desktop)">
        
        {/* Logo */}
        <section className="col-span-8 flex items-center md:col-span-2">
          <Link href="/" className="text-base font-semibold text-foreground">
            <Image
              src="/logo-light.png"
              alt="CrackNCET Logo"
              width={32}
              height={32}
              className="mr-2"
            />
          </Link>
        </section>

        {/* Desktop Nav Links */}
        <section className="hidden md:col-span-7 md:flex md:items-center">
          <NavigationMenu className="w-full justify-start" viewport={false}>
            <NavigationMenuList className="justify-start gap-2">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </section>

        {/* Right Section (Auth / Mobile Nav) */}
        <section className="col-span-4 flex items-center justify-end md:col-span-3">
          
          <MobileNav />

          <section className="hidden md:flex">
            <Suspense fallback={<AuthFallback />}>
              <AuthSection />
            </Suspense>
          </section>

        </section>
      </nav>
    </header>
  );
}
