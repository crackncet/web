"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateTestMutation } from "../../_queries/test-series.queries";
import { TestSeriesTest } from "../../_api/test-series.api";
import { Loader2, Calendar, Clock, AlertTriangle, Pencil, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

const testFormSchema = z.object({
  name: z.string().min(1, "Test name is required").max(255),
  description: z.string().optional(),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  scheduledTime: z.string().min(1, "Start time is required"),
  durationMinutes: z.coerce
    .number()
    .int()
    .positive("Duration must be a positive number"),
  instructions: z.string().optional(),
});

type TestFormInput = z.infer<typeof testFormSchema>;

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

interface EditTestDialogProps {
  testSeriesId: string;
  test: TestSeriesTest;
  children?: React.ReactNode;
}

export function EditTestDialog({
  testSeriesId,
  test,
  children,
}: EditTestDialogProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const updateMutation = useUpdateTestMutation(testSeriesId);

  // Form setup
  const form = useForm<TestFormInput>({
    resolver: zodResolver(testFormSchema as any),
    defaultValues: {
      name: "",
      description: "",
      scheduledDate: "",
      scheduledTime: "",
      durationMinutes: 180,
      instructions: "",
    },
  });

  // Calculate cutoff for editing instructions
  const isInstructionsLocked = test.scheduledAt
    ? new Date().getTime() > new Date(test.scheduledAt).getTime() - 15 * 60 * 1000
    : false;

  useEffect(() => {
    if (open && test) {
      let dateVal = "";
      let timeVal = "";
      if (test.scheduledAt) {
        const d = new Date(test.scheduledAt);
        const pad = (num: number) => String(num).padStart(2, "0");
        dateVal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        timeVal = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }

      form.reset({
        name: test.name,
        description: test.description || "",
        scheduledDate: dateVal,
        scheduledTime: timeVal,
        durationMinutes: test.durationMinutes || 180,
        instructions: test.instructions || "",
      });
    }
  }, [test, open, form]);

  const onSubmit = (data: TestFormInput) => {
    const scheduledAt = `${data.scheduledDate}T${data.scheduledTime}:00`;
    const payload: any = {
      name: data.name,
      description: data.description || null,
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMinutes: data.durationMinutes,
    };

    // Only include instructions if they are not locked
    if (!isInstructionsLocked) {
      payload.instructions = data.instructions || null;
    }

    updateMutation.mutate(
      { testId: test.id, data: payload },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  const triggerBtn = children || (
    <Button
      variant="outline"
      size="sm"
      className="text-xs font-bold gap-1 rounded-xl cursor-pointer border-slate-200 dark:border-slate-800"
    >
      <Pencil className="h-3.5 w-3.5" /> Edit Test
    </Button>
  );

  const formContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
      <FieldGroup className="space-y-4">
        <Field>
          <FieldLabel>Test Name *</FieldLabel>
          <Input
            placeholder="e.g. Major Test 1: Physics & Chemistry"
            {...form.register("name")}
            className="h-9.5 text-xs bg-muted/10"
          />
          {form.formState.errors.name && (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel>Description</FieldLabel>
          <Textarea
            placeholder="Details of the test..."
            {...form.register("description")}
            className="min-h-[70px] text-xs bg-muted/10 resize-none leading-relaxed"
          />
          {form.formState.errors.description && (
            <FieldError>{form.formState.errors.description.message}</FieldError>
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field>
            <FieldLabel>Scheduled Date *</FieldLabel>
            <Input
              type="date"
              {...form.register("scheduledDate")}
              className="h-9.5 text-xs bg-muted/10 cursor-pointer"
            />
            {form.formState.errors.scheduledDate && (
              <FieldError>{form.formState.errors.scheduledDate.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Start Time *</FieldLabel>
            <Input
              type="time"
              {...form.register("scheduledTime")}
              className="h-9.5 text-xs bg-muted/10 cursor-pointer"
            />
            {form.formState.errors.scheduledTime && (
              <FieldError>{form.formState.errors.scheduledTime.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Duration (Mins) *</FieldLabel>
            <Input
              type="number"
              placeholder="e.g. 180"
              {...form.register("durationMinutes")}
              className="h-9.5 text-xs bg-muted/10"
            />
            {form.formState.errors.durationMinutes && (
              <FieldError>{form.formState.errors.durationMinutes.message}</FieldError>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel>Exam Instructions</FieldLabel>
          {isInstructionsLocked && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 mb-2 select-none">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="text-[10px] leading-relaxed">
                Instructions are locked and cannot be modified within 15 minutes of the scheduled start time.
              </div>
            </div>
          )}
          <Textarea
            placeholder="Specific instructions for this test (falls back to test series instructions if left blank)..."
            {...form.register("instructions")}
            disabled={isInstructionsLocked}
            className="min-h-[100px] text-xs bg-muted/10 resize-none leading-relaxed"
          />
          {form.formState.errors.instructions && (
            <FieldError>{form.formState.errors.instructions.message}</FieldError>
          )}
        </Field>
      </FieldGroup>

      {/* Submit Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenChange(false)}
          className="h-9 text-xs font-semibold px-4 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-9 text-xs font-bold px-5 cursor-pointer"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending && (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{triggerBtn}</DialogTrigger>
        <DialogContent className="sm:max-w-[600px] w-[95vw] sm:p-6 p-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Edit Test Details
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Update test schedule, duration, and instructions.
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{triggerBtn}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="!h-[85vh] !max-h-[85vh] w-full rounded-t-[20px] p-4 overflow-y-auto border-t border-border"
      >
        <SheetHeader className="p-0 mb-4">
          <SheetTitle className="text-base font-bold">
            Edit Test Details
          </SheetTitle>
          <SheetDescription className="text-[11px] text-muted-foreground">
            Update test schedule, duration, and instructions.
          </SheetDescription>
        </SheetHeader>
        {formContent}
      </SheetContent>
    </Sheet>
  );
}
