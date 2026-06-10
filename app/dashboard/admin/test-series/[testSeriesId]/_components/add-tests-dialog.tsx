"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddTestSeriesTestsMutation } from "../../_queries/test-series.queries";
import { Loader2, Plus, Trash2, Calendar, Clock, AlertTriangle } from "lucide-react";
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

const testSchema = z.object({
  name: z.string().min(1, "Test name is required").max(255),
  description: z.string().optional(),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  scheduledTime: z.string().min(1, "Start time is required"),
  durationMinutes: z.coerce
    .number()
    .int()
    .positive("Duration must be a positive number"),
});

type TestFormInput = z.infer<typeof testSchema>;

interface QueuedTest {
  name: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
}

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

interface AddTestsDialogProps {
  testSeriesId: string;
  isActive: boolean;
  startDate: string | null;
  children?: React.ReactNode;
}

function getDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1); // tomorrow
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function AddTestsDialog({
  testSeriesId,
  isActive,
  startDate,
  children,
}: AddTestsDialogProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [testList, setTestList] = useState<QueuedTest[]>([]);

  const addTestsMutation = useAddTestSeriesTestsMutation(testSeriesId);

  const form = useForm<TestFormInput>({
    resolver: zodResolver(testSchema as any),
    defaultValues: {
      name: "",
      description: "",
      scheduledDate: getDefaultDate(),
      scheduledTime: "10:00",
      durationMinutes: 180,
    },
  });

  const isLocked =
    isActive || (startDate ? new Date(startDate) <= new Date() : false);

  const handleAddToList = (data: TestFormInput) => {
    const scheduledAt = `${data.scheduledDate}T${data.scheduledTime}`;
    setTestList((prev) => [
      ...prev,
      {
        name: data.name,
        description: data.description,
        scheduledAt,
        durationMinutes: data.durationMinutes,
      },
    ]);
    form.reset({
      name: "",
      description: "",
      scheduledDate: getDefaultDate(),
      scheduledTime: "10:00",
      durationMinutes: 180,
    });
  };

  const handleRemoveFromList = (index: number) => {
    setTestList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    if (testList.length === 0) return;

    const payload = {
      tests: testList.map((t) => ({
        name: t.name,
        description: t.description || undefined,
        scheduledAt: new Date(t.scheduledAt).toISOString(),
        durationMinutes: t.durationMinutes,
      })),
    };

    addTestsMutation.mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        setTestList([]);
      },
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTestList([]);
      form.reset();
    }
  };

  const triggerBtn = children || (
    <Button disabled={isLocked} className="font-bold text-xs h-9 cursor-pointer">
      <Plus className="h-4 w-4 mr-1.5" />
      Add Tests
    </Button>
  );

  if (isLocked) {
    return (
      <div className="relative group inline-block">
        <Button disabled className="font-bold text-xs h-9 cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Tests
        </Button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-slate-950 text-white text-[10px] p-2 rounded-lg text-center font-medium shadow-md pointer-events-none select-none z-50">
          Cannot add tests to an active or already started test series.
        </div>
      </div>
    );
  }

  const content = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
      {/* Test Creation Form */}
      <div className="lg:col-span-6 space-y-4">
        <div className="border-b border-border/60 pb-1.5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">
            Create Test Slot
          </h4>
        </div>

        <form
          onSubmit={form.handleSubmit(handleAddToList)}
          className="space-y-4"
        >
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
                <FieldError>
                  {form.formState.errors.description.message}
                </FieldError>
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
                  <FieldError>
                    {form.formState.errors.scheduledDate.message}
                  </FieldError>
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
                  <FieldError>
                    {form.formState.errors.scheduledTime.message}
                  </FieldError>
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
                  <FieldError>
                    {form.formState.errors.durationMinutes.message}
                  </FieldError>
                )}
              </Field>
            </div>
          </FieldGroup>

          <Button
            type="submit"
            variant="outline"
            className="w-full text-xs font-bold h-9 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add to Batch
          </Button>
        </form>
      </div>

      {/* Batch Preview List */}
      <div className="lg:col-span-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-border/80 lg:pl-6 pt-6 lg:pt-0">
        <div className="space-y-4 flex-1">
          <div className="border-b border-border/60 pb-1.5 flex justify-between items-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/80">
              Batch Queue ({testList.length})
            </h4>
            {testList.length > 0 && (
              <button
                type="button"
                onClick={() => setTestList([])}
                className="text-[9px] font-extrabold text-rose-500 hover:underline cursor-pointer uppercase tracking-wider"
              >
                Clear All
              </button>
            )}
          </div>

          {testList.length === 0 ? (
            <div className="h-[220px] flex flex-col items-center justify-center text-center border border-dashed border-border/60 rounded-xl bg-slate-50/10 dark:bg-slate-955/5 p-4 select-none">
              <AlertTriangle className="h-5 w-5 text-amber-500/60 mb-2" />
              <p className="text-[10px] font-bold text-muted-foreground">
                No Tests in Batch
              </p>
              <p className="text-[9px] text-muted-foreground/60 max-w-[180px] mt-0.5">
                Fill the form on the left and click "Add to Batch" to queue tests for bulk creation.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {testList.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/30 group animate-in slide-in-from-bottom-2 duration-200"
                >
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-bold text-slate-850 dark:text-slate-200 line-clamp-1">
                      {test.name}
                    </h5>
                    <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(test.scheduledAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.durationMinutes} mins
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromList(index)}
                    className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                    title="Remove from batch"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="h-9 text-xs font-semibold px-4 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 text-xs font-bold px-5 cursor-pointer"
            onClick={handleSaveAll}
            disabled={testList.length === 0 || addTestsMutation.isPending}
          >
            {addTestsMutation.isPending && (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            )}
            Save Batch Tests
          </Button>
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{triggerBtn}</DialogTrigger>
        <DialogContent className="sm:max-w-[800px] w-[95vw] sm:p-6 p-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <DialogTitle className="text-base font-bold">
                Bulk Add Tests
              </DialogTitle>
            </div>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Define scheduled test dates and durations to bulk create tests.
            </DialogDescription>
          </DialogHeader>
          {content}
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
          <div className="flex items-center gap-2 text-primary">
            <SheetTitle className="text-base font-bold">
              Bulk Add Tests
            </SheetTitle>
          </div>
          <SheetDescription className="text-[11px] text-muted-foreground">
            Define scheduled test dates and durations to bulk create tests.
          </SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
