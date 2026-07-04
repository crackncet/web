"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { User, Phone, Mail, Shield, Check, Loader2, Camera, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useUser, useForgotPassword } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { uploadFile } from "@/lib/upload-utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function ProfileView() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const queryClient = useQueryClient();
  const forgotPasswordMutation = useForgotPassword();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-6 text-center select-none">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <h3 className="text-base font-bold text-foreground mb-1">Failed to Load Profile</h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          We couldn't retrieve your profile details. Please try logging out and logging back in.
        </p>
      </div>
    );
  }

  // Handle Full Name changes
  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    setIsUpdatingDetails(true);
    try {
      await apiClient.patch("/profile/details", {
        fullName: fullName.trim(),
      });
      toast.success("Profile details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  // Handle Profile Image Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadProgress(0);

    try {
      // 1. Upload file to R2
      const result = await uploadFile({
        file,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      // 2. Link the uploaded image to profile
      await apiClient.patch("/profile/image", {
        profileImageUrl: result.publicUrl,
      });

      toast.success("Profile image updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload profile image");
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Trigger file upload selector
  const triggerImageSelect = () => {
    if (!isUploadingImage) {
      fileInputRef.current?.click();
    }
  };

  // Handle Password Reset Request
  const handleRequestPasswordReset = () => {
    forgotPasswordMutation.mutate(
      { email: user.email },
      {
        onSuccess: () => {
          toast.success(`A password reset link has been dispatched to ${user.email}`);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to dispatch password reset request.");
        },
      }
    );
  };

  const initial = user.fullName?.[0]?.toUpperCase() || "U";

  return (
    <div className="w-full space-y-6 select-none max-w-5xl mx-auto px-4 sm:px-0">
      {/* Profile Header Card */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden rounded-2xl md:rounded-3xl">
        <div className="h-28 sm:h-50 bg-gradient-to-r from-violet-600/10 via-indigo-500/10 to-purple-500/10 border-b border-slate-100 dark:border-slate-800">
          <Image src="/profilebanner.jpg" alt="Profile Banner" width={1920} height={1080} className="w-full h-full object-cover" />
        </div>
        
        <CardContent className="relative pt-0 px-6 pb-6 flex flex-col items-center sm:items-start text-center sm:text-left">
          {/* Avatar frame */}
          <div className="absolute -top-12 sm:-top-16 left-1/2 sm:left-6 -translate-x-1/2 sm:translate-x-0">
            <div 
              onClick={triggerImageSelect}
              className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-md bg-white dark:bg-slate-850 cursor-pointer group select-none"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-violet-50 dark:bg-violet-955/20 text-violet-600 dark:text-violet-400 font-black text-3xl sm:text-4xl flex items-center justify-center">
                  {initial}
                </div>
              )}

              {/* Upload Hover Overlay */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
              </div>

              {/* Uploading Spinner / Progress Overlay */}
              {isUploadingImage && (
                <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white p-2">
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-violet-400" />
                  <span className="text-[9px] font-extrabold mt-1">{uploadProgress}%</span>
                </div>
              )}
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
            disabled={isUploadingImage}
          />

          {/* User Details Name & Role info */}
          <div className="pt-16 sm:pt-3 sm:pl-40 w-full">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
              {user.fullName}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2 text-xs text-slate-550 dark:text-slate-400">
              <span className="inline-flex items-center justify-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {user.email}
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="inline-flex items-center justify-center gap-1 font-bold text-violet-600 dark:text-violet-400">
                <Shield className="h-3.5 w-3.5" />
                {user.globalRole} {user.isHod && "(HOD)"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Profile Form Details & Security */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Details editor card */}
        <Card className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-black text-slate-900 dark:text-slate-50">
              Personal Information
            </CardTitle>
            <CardDescription className="text-xs">
              Update your account primary details and legal name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              
              {/* Full name input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Full Name
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isUpdatingDetails}
                  className="w-full bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-xs font-semibold"
                  placeholder="Your full name"
                />
              </div>

              {/* Email input (Disabled) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-slate-100/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 pr-10 cursor-not-allowed"
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="text-[10px] text-muted-foreground/80 leading-normal italic">
                  Email addresses are linked directly to your credentials and cannot be edited.
                </p>
              </div>

              {/* Phone number input (Disabled) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  Phone Number
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    value={phone || ""}
                    disabled
                    className="w-full bg-slate-100/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 pr-10 cursor-not-allowed"
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="text-[10px] text-muted-foreground/80 leading-normal italic">
                  Phone number editing is currently not supported.
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <Button 
                  type="submit" 
                  disabled={isUpdatingDetails || fullName.trim() === user.fullName} 
                  className="font-bold text-xs cursor-pointer uppercase tracking-wider px-5 py-2.5 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isUpdatingDetails ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security password reset card */}
        <Card className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs rounded-2xl h-fit">
          <CardHeader>
            <CardTitle className="text-base font-black text-slate-900 dark:text-slate-50">
              Security
            </CardTitle>
            <CardDescription className="text-xs">
              Change password or secure your account credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 bg-violet-50/50 dark:bg-violet-955/10 rounded-xl border border-violet-100/50 dark:border-violet-900/30">
              <h4 className="text-xs font-bold text-violet-900 dark:text-violet-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                How to Change Password?
              </h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal mt-1">
                For security reasons, we send a one-time verification reset link directly to your registered email address. Click the button below to initiate.
              </p>
            </div>

            <Button
              type="button"
              disabled={forgotPasswordMutation.isPending}
              onClick={handleRequestPasswordReset}
              variant="outline"
              className="w-full font-bold text-xs cursor-pointer uppercase tracking-wider h-10 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              {forgotPasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  Sending Link...
                </>
              ) : (
                <>
                  <span>Send Reset Email</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
