"use client";

import React, { useState } from "react";
import { User, Phone, Mail, Shield, Check, Loader2 } from "lucide-react";
import { MemberHeader } from "../layout";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      await apiClient.patch("/profile/details", {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      toast.success("Profile details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const initial = user?.fullName?.[0]?.toUpperCase() || "U";

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
      <MemberHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>SETTINGS</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Profile</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            My Profile
          </h1>
        </div>
      </MemberHeader>

      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 border-b border-slate-100 dark:border-slate-800" />
        <CardContent className="relative pt-0 px-6 pb-6 select-none">
          {/* Avatar frame */}
          <div className="absolute -top-12 left-6">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="h-24 w-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md bg-white dark:bg-slate-800"
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-primary/10 text-primary font-black text-3xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-md">
                {initial}
              </div>
            )}
          </div>

          {/* User main identification metadata */}
          <div className="pt-16">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {user?.fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary">
                <Shield className="h-3.5 w-3.5" />
                {user?.globalRole} {user?.isHod && "(HOD)"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details editor card */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
            Edit Details
          </CardTitle>
          <CardDescription className="text-xs">
            Modify your user details and contact coordinates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4 select-none">
            {/* Full name input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isUpdating}
                className="w-full bg-muted/20 border-border text-xs"
                placeholder="Your full legal name"
              />
            </div>

            {/* Phone number input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                Phone Number
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isUpdating}
                className="w-full bg-muted/20 border-border text-xs"
                placeholder="e.g. +919876543210"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isUpdating} size="sm" className="font-semibold text-xs cursor-pointer">
                {isUpdating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
