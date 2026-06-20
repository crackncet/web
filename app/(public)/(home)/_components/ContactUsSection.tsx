"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import LoginDialog from "@/components/dialogs/LoginDialog";
import { useSubmitQuery } from "@/hooks/use-queries";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { RetroCard } from "@/components/ui/retro-card";

const contactFormSchema = z.object({
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(255, "Subject cannot exceed 255 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactUsSection() {
  const [showLogin, setShowLogin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: user, isLoading: isUserLoading } = useUser();
  const { mutate: submitQuery, isPending: isSubmitting } = useSubmitQuery();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthLoading = !mounted || isUserLoading;
  const showSubmitButton = mounted && !!user;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema as any),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    submitQuery(data, {
      onSuccess: () => {
        toast.success("Query submitted successfully!");
        reset();
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to submit query. Please try again.");
      },
    });
  };

  return (
    <section className="w-full py-12 md:py-20 bg-gradient-to-b from-background to-slate-50/30 dark:to-slate-950/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <p className="text-sm md:text-base font-semibold text-primary tracking-widest uppercase mb-2">
            Contact Us
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            Get in Touch
          </h2>
        </div>

        {/* Outer borderless retro card container */}
        <div className="w-full max-w-5xl mx-auto">
          <RetroCard
            hasShadow={false}
            borderClassName="border-0"
            roundedClassName="rounded-md"
            className="p-6 md:p-10 dark:bg-slate-900/40"
            shadowClassName="bg-primary/5 dark:bg-primary/5"
            isHoverable={false}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
              {/* Left Side: Image Placeholder (Hidden on smaller screens) */}
              <div className="hidden lg:flex lg:col-span-5 justify-center w-full">
                <div className="relative w-full aspect-[4/5] rounded-md overflow-hidden flex items-center justify-center p-4">
                  <img
                    src="/contact-us-form.png"
                    alt="Contact Us Support Illustration"
                    className="w-full h-full object-cover rounded-sm"
                  />
                </div>
              </div>

              {/* Right Side: Form (Takes full width on smaller screens, col-span-7 on large) */}
              <div className="lg:col-span-7 w-full flex flex-col justify-center">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <FieldGroup className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="fullName">Name</FieldLabel>
                        <Input
                          id="fullName"
                          value={showSubmitButton ? user.fullName : ""}
                          placeholder={isAuthLoading ? "Loading..." : "Login to view name"}
                          disabled
                          className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/60"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          value={showSubmitButton ? user.email || "" : ""}
                          placeholder={isAuthLoading ? "Loading..." : "Login to view email"}
                          disabled
                          className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/60"
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="subject">Subject</FieldLabel>
                      <Input
                        id="subject"
                        placeholder="What is your query about?"
                        {...register("subject")}
                        disabled={isSubmitting}
                      />
                      {errors.subject && (
                        <FieldError>{errors.subject.message}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="message">Message</FieldLabel>
                      <Textarea
                        id="message"
                        placeholder="Please describe your query in detail..."
                        className="min-h-[120px] resize-y"
                        {...register("message")}
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <FieldError>{errors.message.message}</FieldError>
                      )}
                    </Field>
                  </FieldGroup>

                  {showSubmitButton ? (
                    <Button
                      type="submit"
                      className="w-full md:w-auto px-8"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Query
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setShowLogin(true)}
                      className="w-full md:w-auto px-8"
                      disabled={isAuthLoading}
                    >
                      Login to Submit Query
                    </Button>
                  )}
                </form>
              </div>
            </div>
          </RetroCard>
        </div>
      </div>

      {/* Controlled Login Dialog */}
      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        trigger={null}
      />
    </section>
  );
}