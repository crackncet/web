"use client";

import React, { useState } from "react";
import { Enrollment } from "../_api/enrollments.api";
import {
  useRevokeEnrollmentMutation,
  useResumeEnrollmentMutation,
  useExtendEnrollmentMutation,
} from "../_queries/enrollments.queries";
import {
  ShieldAlert,
  Loader2,
  Calendar,
  Ban,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EnrollmentsTableProps {
  enrollments: Enrollment[];
  isLoading: boolean;
}

export function EnrollmentsTable({ enrollments, isLoading }: EnrollmentsTableProps) {
  const { mutate: revokeEnrollment, isPending: isRevoking } = useRevokeEnrollmentMutation();
  const { mutate: resumeEnrollment, isPending: isResuming } = useResumeEnrollmentMutation();
  const { mutate: extendEnrollment, isPending: isExtending } = useExtendEnrollmentMutation();

  const [actionEnrollment, setActionEnrollment] = useState<Enrollment | null>(null);
  const [actionType, setActionType] = useState<"revoke" | "resume" | "extend" | null>(null);
  const [expiryDate, setExpiryDate] = useState<string>("");

  const handleActionOpen = (enrollment: Enrollment, type: "revoke" | "resume" | "extend") => {
    setActionEnrollment(enrollment);
    setActionType(type);
    if (type === "extend") {
      // Default to existing expiration date formatted for input type="date", or today
      if (enrollment.expiresAt) {
        setExpiryDate(new Date(enrollment.expiresAt).toISOString().split("T")[0]);
      } else {
        setExpiryDate(new Date().toISOString().split("T")[0]);
      }
    }
  };

  const handleActionConfirm = () => {
    if (!actionEnrollment || !actionType) return;

    if (actionType === "revoke") {
      revokeEnrollment(actionEnrollment.id, {
        onSuccess: () => handleActionClose(),
      });
    } else if (actionType === "resume") {
      resumeEnrollment(actionEnrollment.id, {
        onSuccess: () => handleActionClose(),
      });
    } else if (actionType === "extend") {
      // Convert date string back to ISO string or null
      const formattedDate = expiryDate ? new Date(expiryDate).toISOString() : null;
      extendEnrollment(
        { enrollmentId: actionEnrollment.id, expiresAt: formattedDate },
        {
          onSuccess: () => handleActionClose(),
        }
      );
    }
  };

  const handleActionClose = () => {
    setActionEnrollment(null);
    setActionType(null);
    setExpiryDate("");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Lifetime Access";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-2 text-sm font-medium">
          Loading student enrollments...
        </p>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center">
        <ShieldAlert className="h-10 w-10 text-muted-foreground/60 mb-2" />
        <h3 className="font-medium text-foreground text-base">
          No enrollments found
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1 font-normal">
          We couldn't find any enrollments matching the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs font-medium uppercase tracking-wider select-none">
            <th className="px-6 py-4">Student Details</th>
            <th className="px-6 py-4">Enrollment Item</th>
            <th className="px-6 py-4">Purchase Details</th>
            <th className="px-6 py-4">Validity</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-foreground/80 text-sm">
          {enrollments.map((enrollment) => {
            const expired = isExpired(enrollment.expiresAt);
            const statusStyle =
              enrollment.status === "ACTIVE" && !expired
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : enrollment.status === "REVOKED"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";

            return (
              <tr key={enrollment.id} className="hover:bg-muted/10 transition-colors">
                {/* Student Details */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {enrollment.studentName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {enrollment.studentEmail}
                    </span>
                  </div>
                </td>

                {/* Course or Test Series Item */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {enrollment.courseId ? (
                      <>
                        <span className="font-medium text-foreground">
                          {enrollment.courseTitle}
                        </span>
                        <span className="inline-flex items-center w-max px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 uppercase tracking-wider">
                          Course
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-foreground">
                          {enrollment.testSeriesName}
                        </span>
                        <span className="inline-flex items-center w-max px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 uppercase tracking-wider">
                          Test Series
                        </span>
                      </>
                    )}
                  </div>
                </td>

                {/* Order Details */}
                <td className="px-6 py-4">
                  <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                    <div className="flex items-center gap-1 font-mono">
                      <span>Order:</span>
                      <span className="text-foreground/90 font-medium">
                        {enrollment.providerOrderId || "Manual/Free"}
                      </span>
                    </div>
                    <div>Enrolled: {formatDate(enrollment.createdAt)}</div>
                  </div>
                </td>

                {/* Validity / Expires At */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-foreground/80">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={expired ? "text-red-600 dark:text-red-400 font-semibold" : ""}>
                      {formatDate(enrollment.expiresAt)}
                    </span>
                  </div>
                </td>

                {/* Status Badging */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle}`}>
                    {expired && enrollment.status === "ACTIVE" ? "EXPIRED" : enrollment.status}
                  </span>
                </td>

                {/* Action Buttons */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActionOpen(enrollment, "extend")}
                      className="h-8 text-xs gap-1 border-border bg-card hover:bg-muted/50"
                    >
                      <Clock className="h-3 w-3" />
                      Extend
                    </Button>
                    
                    {enrollment.status === "ACTIVE" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActionOpen(enrollment, "revoke")}
                        className="h-8 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <Ban className="h-3 w-3" />
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActionOpen(enrollment, "resume")}
                        className="h-8 text-xs gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Resume
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Confirmation and Date Extension Dialog */}
      <Dialog open={actionEnrollment !== null} onOpenChange={(open) => !open && handleActionClose()}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              {actionType === "extend" && "Extend Validity"}
              {actionType === "revoke" && "Revoke Enrollment"}
              {actionType === "resume" && "Resume Enrollment"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {actionType === "extend" &&
                `Modify the validity expiration date for ${actionEnrollment?.studentName}'s enrollment.`}
              {actionType === "revoke" &&
                `Are you sure you want to revoke access for ${actionEnrollment?.studentName}? They will immediately lose access to all course materials.`}
              {actionType === "resume" &&
                `Are you sure you want to resume access for ${actionEnrollment?.studentName}? They will regain access to course materials.`}
            </DialogDescription>
          </DialogHeader>

          {actionType === "extend" && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="expiry" className="text-sm font-medium">
                  Expiry Date
                </Label>
                <Input
                  id="expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="bg-card border-border"
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave empty for lifetime / unlimited access.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={handleActionClose} className="text-xs">
              Cancel
            </Button>
            <Button
              variant={actionType === "revoke" ? "destructive" : "default"}
              onClick={handleActionConfirm}
              disabled={isRevoking || isResuming || isExtending}
              className="text-xs gap-1.5"
            >
              {(isRevoking || isResuming || isExtending) && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {actionType === "extend" && "Update Validity"}
              {actionType === "revoke" && "Confirm Revoke"}
              {actionType === "resume" && "Confirm Resume"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
