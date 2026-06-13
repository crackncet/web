"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

import {
  useSendSignUpOtp,
  useSignUp,
  sendSignUpOtpSchema,
  signUpSchema,
  type SendSignUpOtpInput,
  type SignUpInput,
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

export default function SignupDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: sendOtp, isPending: isSendingOtp } = useSendSignUpOtp();
  const { mutate: signUp, isPending: isSigningUp } = useSignUp();

  const otpForm = useForm<SendSignUpOtpInput>({
    resolver: zodResolver(sendSignUpOtpSchema as any),
    defaultValues: {
      email: "",
    },
  });

  const signupForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema as any),
    defaultValues: {
      email: "",
      otp: "",
      fullName: "",
      phone: "",
      password: "",
    },
  });

  const onSendOtpSubmit = (data: SendSignUpOtpInput) => {
    sendOtp(data, {
      onSuccess: () => {
        toast.success("OTP sent to your email!");
        setVerifiedEmail(data.email);
        signupForm.setValue("email", data.email);
        setOtpSent(true);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const onSignupSubmit = (data: SignUpInput) => {
    const cleanedData = { ...data };
    if (!cleanedData.phone || cleanedData.phone.trim() === "") {
      delete cleanedData.phone;
    }
    signUp(cleanedData, {
      onSuccess: () => {
        toast.success("Account created successfully!");
        setOpen(false);
        resetState();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const resetState = () => {
    setOtpSent(false);
    setVerifiedEmail("");
    otpForm.reset();
    signupForm.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(resetState, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Register</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create an Account</DialogTitle>
          <DialogDescription>
            {!otpSent 
              ? "Enter your email to receive a one-time verification code." 
              : `Enter the code sent to ${verifiedEmail} to complete registration.`}
          </DialogDescription>
        </DialogHeader>

        {!otpSent ? (
          <form onSubmit={otpForm.handleSubmit(onSendOtpSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="otp-email">Email</FieldLabel>
                <Input 
                  id="otp-email" 
                  placeholder="student@crackncet.com" 
                  {...otpForm.register("email")} 
                />
                {otpForm.formState.errors.email && (
                  <FieldError>{otpForm.formState.errors.email.message}</FieldError>
                )}
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={isSendingOtp}>
              {isSendingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="otp">Verification Code (OTP)</FieldLabel>
                <Input 
                  id="otp" 
                  placeholder="Enter 6-digit code" 
                  maxLength={6} 
                  {...signupForm.register("otp")} 
                />
                {signupForm.formState.errors.otp && (
                  <FieldError>{signupForm.formState.errors.otp.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  {...signupForm.register("fullName")} 
                />
                {signupForm.formState.errors.fullName && (
                  <FieldError>{signupForm.formState.errors.fullName.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone Number (Optional)</FieldLabel>
                <Input 
                  id="phone" 
                  placeholder="+919876543210" 
                  {...signupForm.register("phone")} 
                />
                {signupForm.formState.errors.phone && (
                  <FieldError>{signupForm.formState.errors.phone.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <div className="relative">
                  <Input 
                    id="signup-password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a secure password" 
                    {...signupForm.register("password")} 
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
                {signupForm.formState.errors.password && (
                  <FieldError>{signupForm.formState.errors.password.message}</FieldError>
                )}
              </Field>
            </FieldGroup>

            <div className="flex flex-col gap-2 pt-2">
              <Button type="submit" className="w-full" disabled={isSigningUp}>
                {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Registration
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setOtpSent(false)}
              >
                Back
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
