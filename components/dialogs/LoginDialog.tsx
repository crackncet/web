"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

import {
  useLogin,
  useForgotPassword,
  loginSchema,
  forgotPasswordSchema,
  type LoginInput,
  type ForgotPasswordInput,
} from "@/hooks/use-user";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"LOGIN" | "FORGOT_PASSWORD">("LOGIN");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { mutate: forgotPassword, isPending: isSendingReset } = useForgotPassword();

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      identifier: "",
      method: "PASSWORD",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema as any),
    defaultValues: {
      email: "",
    },
  });

  const onLoginSubmit = (data: LoginInput) => {
    login(data, {
      onSuccess: () => {
        toast.success("Welcome back!");
        setOpen(false);
        loginForm.reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const onForgotSubmit = (data: ForgotPasswordInput) => {
    forgotPassword(data, {
      onSuccess: () => {
        toast.success("If an account exists, a reset link has been sent to your email.");
        setMode("LOGIN");
        forgotPasswordForm.reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setMode("LOGIN");
        loginForm.reset();
        forgotPasswordForm.reset();
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">Login</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        {mode === "LOGIN" ? (
          <>
            <DialogHeader>
              <DialogTitle>Welcome Back</DialogTitle>
              <DialogDescription>
                Enter your credentials to access your account
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="identifier">Email or Phone</FieldLabel>
                  <Input 
                    id="identifier" 
                    placeholder="student@crackncet.com" 
                    {...loginForm.register("identifier")} 
                  />
                  {loginForm.formState.errors.identifier && (
                    <FieldError>{loginForm.formState.errors.identifier.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      {...loginForm.register("password")} 
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
                  {loginForm.formState.errors.password && (
                    <FieldError>{loginForm.formState.errors.password.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-normal h-auto text-muted-foreground"
                  onClick={() => setMode("FORGOT_PASSWORD")}
                >
                  Forgot password?
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={forgotPasswordForm.handleSubmit(onForgotSubmit)} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input 
                    id="email" 
                    placeholder="student@crackncet.com" 
                    {...forgotPasswordForm.register("email")} 
                  />
                  {forgotPasswordForm.formState.errors.email && (
                    <FieldError>{forgotPasswordForm.formState.errors.email.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={isSendingReset}>
                {isSendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => setMode("LOGIN")}
              >
                Back to Login
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
