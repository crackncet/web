"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useExamsQuery } from "../../metadata/_queries/exams.queries";
import { useStreamsQuery } from "../../metadata/_queries/streams.queries";
import { useUpdateTestSeriesMutation } from "../_queries/test-series.queries";
import { TestSeries } from "../_api/test-series.api";
import { Loader2, Sparkles, X, Pencil } from "lucide-react";
import { FileUploader } from "@/components/ui/file-uploader";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

const testSeriesFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  banner: z.string().url("Banner must be a valid URL").or(z.literal("")).optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal number (e.g. 999 or 999.99)"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  examId: z.string().uuid("Please select an exam"),
  streamId: z.array(z.string().uuid()).min(1, "Select at least one stream"),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isEnrollmentOpen: z.boolean().optional(),
});

type TestSeriesFormInput = z.infer<typeof testSeriesFormSchema>;

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

function formatToDatetimeLocal(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EditTestSeriesDialogProps {
  testSeries: TestSeries;
  linkedStreamIds: string[];
  children?: React.ReactNode;
}

export function EditTestSeriesDialog({ testSeries, linkedStreamIds, children }: EditTestSeriesDialogProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Fetch metadata options
  const { data: exams, isLoading: isExamsLoading } = useExamsQuery({ isActive: true });
  const { data: streams, isLoading: isStreamsLoading } = useStreamsQuery();

  const updateMutation = useUpdateTestSeriesMutation();

  const form = useForm<TestSeriesFormInput>({
    resolver: zodResolver(testSeriesFormSchema as any),
    defaultValues: {
      name: "",
      description: "",
      banner: "",
      price: "",
      startDate: "",
      endDate: "",
      examId: "",
      streamId: [],
      isActive: false,
      isPublished: false,
      isEnrollmentOpen: false,
    },
  });

  // Prefill form values when open/props change
  useEffect(() => {
    if (testSeries && open) {
      form.reset({
        name: testSeries.name,
        description: testSeries.description || "",
        banner: testSeries.banner || "",
        price: testSeries.price,
        startDate: testSeries.startDate ? formatToDatetimeLocal(testSeries.startDate) : "",
        endDate: testSeries.endDate ? formatToDatetimeLocal(testSeries.endDate) : "",
        examId: testSeries.examId,
        streamId: linkedStreamIds || [],
        isActive: testSeries.isActive,
        isPublished: testSeries.isPublished,
        isEnrollmentOpen: testSeries.isEnrollmentOpen ?? false,
      });
    }
  }, [testSeries, linkedStreamIds, open, form]);

  const selectedStreams = form.watch("streamId") || [];

  const handleStreamToggle = (streamId: string) => {
    const current = [...selectedStreams];
    const index = current.indexOf(streamId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(streamId);
    }
    form.setValue("streamId", current, { shouldValidate: true });
  };

  const onSubmit = (data: TestSeriesFormInput) => {
    const payload: any = {
      name: data.name,
      description: data.description || null,
      banner: data.banner || null,
      price: data.price,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      examId: data.examId,
      streamId: data.streamId,
      isActive: data.isActive,
      isPublished: data.isPublished,
      isEnrollmentOpen: data.isEnrollmentOpen,
    };

    updateMutation.mutate(
      { testSeriesId: testSeries.id, data: payload },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const triggerBtn = children || (
    <Button variant="outline" size="icon" className="h-9.5 w-9.5 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
      <Pencil className="h-4 w-4" />
    </Button>
  );

  const formContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-3">
      <FieldGroup className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <div className="border-b border-border/60 pb-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">Basic Information</h4>
          </div>

          {/* Name */}
          <Field>
            <FieldLabel>Test Series Name *</FieldLabel>
            <Input
              placeholder="e.g. NEET Ultimate Test Series 2026"
              {...form.register("name")}
              className="h-10 text-sm bg-muted/10"
            />
            {form.formState.errors.name && (
              <FieldError>{form.formState.errors.name.message}</FieldError>
            )}
          </Field>

          {/* Description */}
          <Field>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              placeholder="Provide a comprehensive test series details..."
              {...form.register("description")}
              className="min-h-[90px] text-sm bg-muted/10 resize-none leading-relaxed"
            />
            {form.formState.errors.description && (
              <FieldError>{form.formState.errors.description.message}</FieldError>
            )}
          </Field>

          {/* Banner Upload */}
          <Field>
            <FieldLabel>Test Series Banner Image</FieldLabel>
            {form.watch("banner") ? (
              <div className="relative border border-border rounded-xl overflow-hidden aspect-video bg-muted/10 max-h-[180px] flex items-center justify-center group">
                <img 
                  src={form.watch("banner")} 
                  alt="Test Series Banner Preview" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <button
                  type="button"
                  onClick={() => form.setValue("banner", "", { shouldValidate: true })}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors duration-200 cursor-pointer"
                  title="Remove Banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <FileUploader
                accept="image/*"
                onUploadComplete={(result) => {
                  form.setValue("banner", result.publicUrl, { shouldValidate: true });
                }}
              />
            )}
            {form.formState.errors.banner && (
              <FieldError>{form.formState.errors.banner.message}</FieldError>
            )}
          </Field>
        </div>

        {/* Section 2: Pricing & Targeting */}
        <div className="space-y-4">
          <div className="border-b border-border/60 pb-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">Targeting & Pricing</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Exam Select */}
            <Field>
              <FieldLabel>Target Exam *</FieldLabel>
              <Select
                value={form.watch("examId")}
                onValueChange={(val) => form.setValue("examId", val, { shouldValidate: true })}
              >
                <SelectTrigger className="h-10 text-sm bg-muted/10">
                  <SelectValue placeholder={isExamsLoading ? "Loading..." : "Select Exam"} />
                </SelectTrigger>
                <SelectContent>
                  {exams?.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.examId && (
                <FieldError>{form.formState.errors.examId.message}</FieldError>
              )}
            </Field>

            {/* Price */}
            <Field>
              <FieldLabel>Price (INR) *</FieldLabel>
              <Input
                placeholder="e.g. 999"
                {...form.register("price")}
                className="h-10 text-sm bg-muted/10"
              />
              {form.formState.errors.price && (
                <FieldError>{form.formState.errors.price.message}</FieldError>
              )}
            </Field>
          </div>
        </div>

        {/* Section 3: Academic Scope & Schedule */}
        <div className="space-y-4">
          <div className="border-b border-border/60 pb-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">Academic Scope & Schedule</h4>
          </div>

          {/* Streams Multi-Select (badges) */}
          <Field>
            <FieldLabel>Associated Streams (Select at least one) *</FieldLabel>
            {isStreamsLoading ? (
              <div className="text-xs text-muted-foreground animate-pulse">Loading streams...</div>
            ) : (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {streams?.map((stream) => {
                  const isSelected = selectedStreams.includes(stream.id);
                  return (
                    <button
                      key={stream.id}
                      type="button"
                      onClick={() => handleStreamToggle(stream.id)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-sm scale-[1.02]"
                          : "bg-muted/30 hover:bg-muted/50 border-border/70 text-muted-foreground"
                      }`}
                    >
                      {stream.name}
                    </button>
                  );
                })}
              </div>
            )}
            {form.formState.errors.streamId && (
              <FieldError>{form.formState.errors.streamId.message}</FieldError>
            )}
          </Field>

          {/* 2-Column Row: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Start Date */}
            <Field>
              <FieldLabel>Start Date (Optional)</FieldLabel>
              <Input
                type="datetime-local"
                {...form.register("startDate")}
                className="h-10 text-sm bg-muted/10 cursor-pointer"
              />
              {form.formState.errors.startDate && (
                <FieldError>{form.formState.errors.startDate.message}</FieldError>
              )}
            </Field>

            {/* End Date */}
            <Field>
              <FieldLabel>End Date (Optional)</FieldLabel>
              <Input
                type="datetime-local"
                {...form.register("endDate")}
                className="h-10 text-sm bg-muted/10 cursor-pointer"
              />
              {form.formState.errors.endDate && (
                <FieldError>{form.formState.errors.endDate.message}</FieldError>
              )}
            </Field>
          </div>
        </div>

        {/* Section 4: Status Settings */}
        <div className="space-y-4">
          <div className="border-b border-border/60 pb-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">Status Settings</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* isActive Checkbox */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40">
              <div className="space-y-0.5 select-none">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Status</label>
                <p className="text-[10px] text-muted-foreground">Enable test series access for students.</p>
              </div>
              <input
                type="checkbox"
                {...form.register("isActive")}
                className="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {/* isPublished Checkbox */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40">
              <div className="space-y-0.5 select-none">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Published Status</label>
                <p className="text-[10px] text-muted-foreground">Display test series publicly to everyone.</p>
              </div>
              <input
                type="checkbox"
                {...form.register("isPublished")}
                className="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {/* isEnrollmentOpen Checkbox */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40">
              <div className="space-y-0.5 select-none">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Enrollment Open</label>
                <p className="text-[10px] text-muted-foreground">Allow new signups.</p>
              </div>
              <input
                type="checkbox"
                {...form.register("isEnrollmentOpen")}
                className="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
      </FieldGroup>

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenChange(false)}
          className="h-10 font-semibold px-5"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-10 font-bold px-6"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{triggerBtn}</SheetTrigger>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={`w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-border ${
          isDesktop 
            ? "sm:max-w-xl md:max-w-2xl border-l p-8" 
            : "!h-[75vh] !max-h-[75vh] rounded-t-[20px] p-6 border-t"
        }`}
      >
        <SheetHeader className="mb-2 p-0">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <SheetTitle className="text-lg font-bold">Edit Test Series</SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Update test series details, linked streams, and schedule.
          </SheetDescription>
        </SheetHeader>
        {formContent}
      </SheetContent>
    </Sheet>
  );
}
