"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { useResetPassword, useLogout, resetPasswordSchema, type ResetPasswordInput } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();
  const { mutate: logout } = useLogout();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema as any), // Type-cast to bypass strict Zod 4 check
    defaultValues: {
      token,
      newPassword: "",
    },
  });

  if (!token) {
    return (
      <Card className="w-full max-w-md shadow-lg border-border/40">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">Invalid Link</CardTitle>
          <CardDescription>No reset token was found in the URL. Please request a new link.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = (data: ResetPasswordInput) => {
    resetPassword(data, {
      onSuccess: () => {
        toast.success("Password reset successfully! Logging you out securely...");
        
        // Ensure user is completely logged out after a password reset, 
        // to invalidate any lingering sessions on other devices or locally.
        logout(undefined, {
          onSettled: () => {
            router.push("/");
          }
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-border/40 bg-card">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">Create New Password</CardTitle>
        <CardDescription>
          Please enter your new strong password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
              <div className="relative">
                <Input 
                  id="newPassword" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  {...form.register("newPassword")} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {form.formState.errors.newPassword && (
                <FieldError>{form.formState.errors.newPassword.message}</FieldError>
              )}
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isResetting}>
            {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}