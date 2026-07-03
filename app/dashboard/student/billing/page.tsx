"use client";

import React, { useState } from "react";
import { Sparkles, Calendar, ShieldAlert, Loader2, CreditCard, GraduationCap, Check, HelpCircle, DollarSign } from "lucide-react";
import { StudentHeader } from "../layout";
import { useStudentTransactionsQuery } from "./_queries/billing.queries";

export default function StudentBillingPage() {
  const { data: billingResponse, isLoading } = useStudentTransactionsQuery();
  const enrollments = billingResponse?.data?.enrollments || [];
  const transactions = billingResponse?.data?.transactions || [];

  const [activeTab, setActiveTab] = useState<"enrollments" | "finance">("enrollments");

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Lifetime Access";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 uppercase tracking-wider">
            Paid
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 uppercase tracking-wider">
            Refunded
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 uppercase tracking-wider">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20 uppercase tracking-wider">
            Created
          </span>
        );
    }
  };

  const getEnrollmentStatusBadge = (status: string, expiresAt: string | null) => {
    const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

    if (status === "ACTIVE" && !isExpired) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 uppercase tracking-wider">
          Active
        </span>
      );
    }

    if (status === "REVOKED") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 uppercase tracking-wider">
          Revoked
        </span>
      );
    }

    if (status === "SUSPENDED") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 uppercase tracking-wider">
          Suspended
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20 uppercase tracking-wider">
        Expired
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* StudentHeader portal */}
      <StudentHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-violet-500 shrink-0" />
          <span className="font-extrabold text-slate-850 dark:text-white select-none">Billing & Access</span>
        </div>
      </StudentHeader>

      <div className="flex flex-col gap-1 pb-1">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight select-none">
          Billing & Access Ledger
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium select-none">
          View history of your payments, refunded orders, and program enrollment validity.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border select-none">
        <button
          onClick={() => setActiveTab("enrollments")}
          className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 flex items-center gap-2 -mb-[2px] ${
            activeTab === "enrollments"
              ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          My Enrollments
        </button>
        <button
          onClick={() => setActiveTab("finance")}
          className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2 flex items-center gap-2 -mb-[2px] ${
            activeTab === "finance"
              ? "border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          My Finance
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] p-8">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <p className="text-muted-foreground mt-2 text-sm font-medium">
              Loading ledger data...
            </p>
          </div>
        ) : activeTab === "enrollments" ? (
          /* enrollments tab */
          enrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center">
              <ShieldAlert className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <h3 className="font-bold text-foreground text-base">
                No active program enrollments found
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1 font-normal">
                You have not enrolled in any Course or Test Series yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[10px] font-bold uppercase tracking-wider select-none">
                    <th className="px-6 py-4">Program</th>
                    <th className="px-6 py-4">Enrolled Subjects</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Enrolled</th>
                    <th className="px-6 py-4">Validity / Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground/80 text-xs">
                  {enrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-muted/10 transition-colors">
                      {/* Program Name */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 max-w-[220px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {enr.courseTitle || enr.testSeriesName || "Unnamed Program"}
                          </span>
                          <span className={`inline-flex items-center w-max px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            enr.courseId
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                              : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"
                          }`}>
                            {enr.courseId ? "Course" : "Test Series"}
                          </span>
                        </div>
                      </td>

                      {/* Subjects */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[320px]">
                          {enr.subjects && enr.subjects.length > 0 ? (
                            enr.subjects.map((sub) => (
                              <span
                                key={sub.id}
                                className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 text-[10px] font-medium"
                              >
                                {sub.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">All Syllabus</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getEnrollmentStatusBadge(enr.status, enr.expiresAt)}
                      </td>

                      {/* Date Enrolled */}
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(enr.createdAt)}
                      </td>

                      {/* Validity */}
                      <td className="px-6 py-4 text-slate-650 dark:text-slate-350 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatDate(enr.expiresAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* finance tab */
          transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center">
              <ShieldAlert className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <h3 className="font-bold text-foreground text-base">
                No financial transactions recorded
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1 font-normal">
                No billing statements or invoices were found for your account.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[10px] font-bold uppercase tracking-wider select-none">
                    <th className="px-6 py-4">Purchased Items</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Payment ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground/80 text-xs">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                      {/* Purchased Items */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 max-w-[320px]">
                          {tx.items && tx.items.length > 0 ? (
                            tx.items.map((item) => (
                              <div key={item.id} className="flex flex-col">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {item.itemName}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {item.itemType === "COURSE" ? "Course" : "Test Series"}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-500 font-semibold">Unknown Item</span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300 font-bold text-sm">
                        ₹{parseFloat(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getOrderStatusBadge(tx.status)}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(tx.createdAt)}
                      </td>

                      {/* Payment ID */}
                      <td className="px-6 py-4 font-mono text-slate-500 select-all">
                        {tx.providerPaymentId || "Manual/Admin Allocation"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
