import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  usePublicExamDetailQuery,
} from "../_queries/courseDetail.queries";
import { PublicCourseDetail, PublicCourseSubject } from "../_api/courseDetail.api";
import { Check, Loader2, Sparkles, BookOpen, Layers, Lock } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";
import LoginDialog from "@/components/dialogs/LoginDialog";

interface EnrollmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course: PublicCourseDetail;
}

export function EnrollmentDialog({ isOpen, onClose, course }: EnrollmentDialogProps) {
  const { data: exam, isLoading: isExamLoading } = usePublicExamDetailQuery(course.examId);

  const { data: user, isLoading: isUserLoading } = useUser();

  const coursePrice = parseFloat(course.price) || 0;
  const testSeriesPrice = course.testSeriesId ? (parseFloat(course.testSeriesPrice || "0") || 0) : 0;
  const couponDiscount = 0; // Dummy coupon discount (for future implementation)
  const totalBatchPrice = coursePrice + testSeriesPrice - couponDiscount;

  // States
  const [selectedOptionalStream, setSelectedOptionalStream] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isModalBehaviorDisabled, setIsModalBehaviorDisabled] = useState(false);

  // Detect screen size on client side
  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setSelectedOptionalStream("");
      setSelectedSubjects([]);
      setEnrollmentSuccess(false);
      setIsModalBehaviorDisabled(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rules = exam?.enrollmentRules;

  // Group course subjects by stream (normalized uppercase)
  const courseSubjectsGroupedByStream: Record<string, PublicCourseSubject[]> = {};
  course.subjects.forEach((sub) => {
    const key = sub.streamName.toUpperCase();
    if (!courseSubjectsGroupedByStream[key]) {
      courseSubjectsGroupedByStream[key] = [];
    }
    courseSubjectsGroupedByStream[key].push(sub);
  });

  // Extract optional streams available in course
  const optionalOptions = rules?.streamSelection?.optionalGroup?.options || [];
  const availableOptionalStreams = optionalOptions.filter((opt: string) =>
    course.streams.some((s) => s.toUpperCase() === opt.toUpperCase())
  );

  // Compulsory stream key (e.g. BED)
  const compulsoryStreamKey = (rules?.streamSelection?.compulsory?.[0] || "BEd").toUpperCase();
  const compulsorySubjects = course.subjects.filter(
    (sub) => sub.streamName.toUpperCase() === compulsoryStreamKey
  );

  // Selected optional stream subjects
  const optionalSubjects = course.subjects.filter(
    (sub) => sub.streamName.toUpperCase() === selectedOptionalStream.toUpperCase()
  );

  // Toggle subject selection
  const handleToggleSubject = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  // Perform dynamic validation checks
  const validate = () => {
    const validationErrors: string[] = [];
    const status = {
      streamSelected: false,
      compulsoryNonDomainValid: false,
      compulsoryNonDomainCount: 0,
      compulsoryNonDomainRequired: 0,
      compulsoryLanguageValid: false,
      compulsoryLanguageCount: 0,
      compulsoryLanguageRequired: 0,
      optionalDomainValid: false,
      optionalDomainCount: 0,
      optionalDomainRequired: 0,
    };

    if (!rules) return { isValid: true, errors: [], status };

    // 1. Check Optional Stream Selection
    if (optionalOptions.length > 0) {
      if (!selectedOptionalStream) {
        validationErrors.push("Please select an optional stream (BSc, BA, or BCom).");
      } else {
        status.streamSelected = true;
      }
    } else {
      status.streamSelected = true;
    }

    // 2. Validate Compulsory Stream BEd subject types counts
    const byStreamRules = rules.subjectSelection?.byStream?.[rules.streamSelection?.compulsory?.[0] || "BEd"] || [];
    const selectedCompulsorySubjects = course.subjects.filter(
      (sub) => sub.streamName.toUpperCase() === compulsoryStreamKey && selectedSubjects.includes(sub.id)
    );

    // NON_DOMAIN validation
    const nonDomainRule = byStreamRules.find((r: any) => r.subjectType === "NON_DOMAIN");
    if (nonDomainRule) {
      const count = selectedCompulsorySubjects.filter((s) => s.type === "NON_DOMAIN").length;
      const required = nonDomainRule.requiredCount || nonDomainRule.minCount || 0;
      status.compulsoryNonDomainCount = count;
      status.compulsoryNonDomainRequired = required;
      if (count !== required) {
        validationErrors.push(`Select exactly ${required} Non-Domain subject(s) in compulsory stream.`);
      } else {
        status.compulsoryNonDomainValid = true;
      }
    } else {
      status.compulsoryNonDomainValid = true;
    }

    // LANGUAGE validation
    const languageRule = byStreamRules.find((r: any) => r.subjectType === "LANGUAGE");
    if (languageRule) {
      const count = selectedCompulsorySubjects.filter((s) => s.type === "LANGUAGE").length;
      const required = languageRule.requiredCount || languageRule.minCount || 0;
      status.compulsoryLanguageCount = count;
      status.compulsoryLanguageRequired = required;
      if (count !== required) {
        validationErrors.push(`Select exactly ${required} Language subject(s) in compulsory stream.`);
      } else {
        status.compulsoryLanguageValid = true;
      }
    } else {
      status.compulsoryLanguageValid = true;
    }

    // 3. Validate Optional Stream DOMAIN subjects
    if (selectedOptionalStream) {
      const byOptionalRules = rules.subjectSelection?.byOptionalGroup || [];
      const domainRule = byOptionalRules.find((r: any) => r.subjectType === "DOMAIN");
      if (domainRule) {
        const selectedOptSubjects = course.subjects.filter(
          (sub) =>
            sub.streamName.toUpperCase() === selectedOptionalStream.toUpperCase() &&
            selectedSubjects.includes(sub.id)
        );
        const count = selectedOptSubjects.filter((s) => s.type === "DOMAIN").length;
        const required = domainRule.requiredCount || domainRule.minCount || 0;
        status.optionalDomainCount = count;
        status.optionalDomainRequired = required;
        if (count !== required) {
          validationErrors.push(`Select exactly ${required} Domain subject(s) from your selected optional stream.`);
        } else {
          status.optionalDomainValid = true;
        }
      } else {
        status.optionalDomainValid = true;
      }
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      status,
    };
  };

  const { isValid, status } = validate();

  // Submit enrollment selection
  const handleEnrollSubmit = async () => {
    if (!isValid) {
      toast.error("Please satisfy all subject selection rules before enrolling.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Dynamically load Razorpay SDK
      const scriptLoaded = await new Promise((resolve) => {
        if ((window as any).Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      // 2. Create the backend order and Razorpay order
      const orderRes = await apiClient.post<any>("/payments/orders", {
        itemType: "COURSE",
        referenceId: course.id,
        subjectIds: selectedSubjects,
      });

      const { order, razorpayOrder, keyId } = orderRes.data.data;

      // 3. Trigger Razorpay Checkout modal
      setIsModalBehaviorDisabled(true);
      // Ensure body pointer events are enabled immediately before modal renders
      document.body.style.pointerEvents = "auto";

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "CrackNCET",
        description: `Enrollment for ${course.title}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          setIsSubmitting(true);
          try {
            // 4. Verify signature on the backend
            await apiClient.post("/payments/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            setIsModalBehaviorDisabled(false);
            setEnrollmentSuccess(true);
            toast.success("Payment verified and enrolled successfully!");
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed.");
            setIsModalBehaviorDisabled(false);
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: function () {
            setIsModalBehaviorDisabled(false);
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      const msg = err.message || "Failed to initiate enrollment payment.";
      toast.error(msg);
      setIsModalBehaviorDisabled(false);
      setIsSubmitting(false);
    }
  };

  const wizardContent = (
    <div className="w-full h-full text-slate-900 dark:text-slate-100">
      {isUserLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-xs font-bold text-slate-505 tracking-wide">Checking authentication status...</p>
        </div>
      ) : !user ? (
        <div className="text-center py-12 space-y-6 animate-in fade-in duration-300">
          <div className="mx-auto w-16 h-16 bg-violet-50 dark:bg-violet-955/40 rounded-full flex items-center justify-center border border-violet-100/40 dark:border-violet-900/20">
            <Lock className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Sign In Required
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
              Please sign in to configure your subjects and enroll in <strong className="text-slate-800 dark:text-slate-200">{course.title}</strong>.
            </p>
          </div>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="px-6 h-11 bg-violet-600 hover:bg-violet-750 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow transition-colors cursor-pointer"
          >
            Sign In / Login
          </button>
          <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} trigger={null} />
        </div>
      ) : isExamLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-xs font-bold text-slate-500 tracking-wide">Loading Exam Enrollment Rules...</p>
        </div>
      ) : enrollmentSuccess ? (
        <div className="text-center py-8 space-y-6 animate-in fade-in duration-300">
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center border border-emerald-200 dark:border-emerald-900/40">
            <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Enrollment Successful!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
              You have successfully enrolled in <strong className="text-slate-850 dark:text-slate-205">{course.title}</strong> and configured your subjects. Welcome to the batch!
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-6 h-11 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold uppercase tracking-wider text-xs rounded-xl shadow transition-colors cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
              Enroll into {course.title} 
            </h3>
            <p className="text-slate-550 dark:text-slate-400 text-xs mt-1.5">
              Fill your choices for <strong className="text-slate-800 dark:text-slate-200">{course.title}</strong> as per the {exam?.name} Board specifications.
            </p>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 1. Optional Stream Selection */}
              {availableOptionalStreams.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 space-y-3 shadow-xs">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    Step 1: Choose Your Optional Stream (Select 1)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableOptionalStreams.map((stream: string) => {
                      const isSelected = selectedOptionalStream.toUpperCase() === stream.toUpperCase();
                      return (
                        <button
                          key={stream}
                          onClick={() => {
                            setSelectedOptionalStream(stream);
                            // Clear previously selected optional stream subjects
                            const newSubjects = selectedSubjects.filter((id) => {
                              const sub = course.subjects.find((s) => s.id === id);
                              return sub && sub.streamName.toUpperCase() !== selectedOptionalStream.toUpperCase();
                            });
                            setSelectedSubjects(newSubjects);
                          }}
                          className={`h-11 rounded-xl font-black text-xs uppercase tracking-wide transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                              : "bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-850"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          {stream}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Subjects Configuration Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 space-y-6 shadow-xs">
                
                {/* Category A: Compulsory Stream Subjects (BEd) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-violet-600" />
                      Compulsory Stream: {rules?.streamSelection?.compulsory?.[0] || "BEd"}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Required
                    </span>
                  </div>

                  {/* Non-Domain Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">
                      <span>Non-Domain Subjects</span>
                      <span className={status.compulsoryNonDomainValid ? "text-emerald-600" : "text-slate-450"}>
                        Selected: {status.compulsoryNonDomainCount} / {status.compulsoryNonDomainRequired}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {compulsorySubjects
                        .filter((s) => s.type === "NON_DOMAIN")
                        .map((sub) => {
                          const isChecked = selectedSubjects.includes(sub.id);
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleToggleSubject(sub.id)}
                              className={`h-11 px-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                                isChecked
                                  ? "bg-violet-50/50 dark:bg-violet-950/20 border-violet-550 text-violet-750 dark:text-violet-400"
                                  : "bg-slate-50 dark:bg-slate-955 border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50"
                              }`}
                            >
                              <span className="text-xs font-bold uppercase tracking-wide">{sub.name}</span>
                              <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                                isChecked ? "bg-violet-600 border-violet-600 text-white" : "border-slate-300 dark:border-slate-700"
                              }`}>
                                {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Language Section */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">
                      <span>Language Subjects</span>
                      <span className={status.compulsoryLanguageValid ? "text-emerald-600" : "text-slate-450"}>
                        Selected: {status.compulsoryLanguageCount} / {status.compulsoryLanguageRequired}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {compulsorySubjects
                        .filter((s) => s.type === "LANGUAGE")
                        .map((sub) => {
                          const isChecked = selectedSubjects.includes(sub.id);
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleToggleSubject(sub.id)}
                              className={`h-11 px-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                                isChecked
                                  ? "bg-violet-50/50 dark:bg-violet-950/20 border-violet-550 text-violet-750 dark:text-violet-400"
                                  : "bg-slate-50 dark:bg-slate-955 border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50"
                              }`}
                            >
                              <span className="text-xs font-bold uppercase tracking-wide">{sub.name}</span>
                              <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                                isChecked ? "bg-violet-600 border-violet-600 text-white" : "border-slate-300 dark:border-slate-700"
                              }`}>
                                {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      {compulsorySubjects.filter((s) => s.type === "LANGUAGE").length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">No language subjects available in this course.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category B: Optional Stream Subjects */}
                {selectedOptionalStream && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-violet-600" />
                        Optional Stream: {selectedOptionalStream}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        Selected Optional
                      </span>
                    </div>

                    {/* Domain Section */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-wide">
                        <span>Domain Subjects</span>
                        <span className={status.optionalDomainValid ? "text-emerald-600" : "text-slate-450"}>
                          Selected: {status.optionalDomainCount} / {status.optionalDomainRequired}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {optionalSubjects
                          .filter((s) => s.type === "DOMAIN")
                          .map((sub) => {
                            const isChecked = selectedSubjects.includes(sub.id);
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleToggleSubject(sub.id)}
                                className={`h-11 px-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                                  isChecked
                                    ? "bg-violet-50/50 dark:bg-violet-950/20 border-violet-550 text-violet-750 dark:text-violet-400"
                                    : "bg-slate-50 dark:bg-slate-955 border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50"
                                }`}
                              >
                                <span className="text-xs font-bold uppercase tracking-wide">{sub.name}</span>
                                <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                                  isChecked ? "bg-violet-600 border-violet-600 text-white" : "border-slate-300 dark:border-slate-700"
                                }`}>
                                  {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        {optionalSubjects.filter((s) => s.type === "DOMAIN").length === 0 && (
                          <p className="text-[10px] text-slate-400 italic col-span-2">No domain subjects available for {selectedOptionalStream} in this course.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Status & Rules Validation Checkbox list */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Validation Progress Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 dark:border-slate-800 pb-2">
                  Subject Selection Rules Check
                </h4>
                
                <div className="space-y-3 text-xs">
                  
                  {/* Optional Stream rule */}
                  <div className="flex items-start gap-2.5">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border ${
                      status.streamSelected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-450"
                    }`}>
                      {status.streamSelected ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <div className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-extrabold block text-slate-850 dark:text-slate-200">1. Optional Stream Chosen</span>
                      <span className="text-[10px] text-slate-450 block">Select BSc, BA or BCom stream.</span>
                    </div>
                  </div>

                  {/* Non Domain rule */}
                  <div className="flex items-start gap-2.5">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border ${
                      status.compulsoryNonDomainValid ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-450"
                    }`}>
                      {status.compulsoryNonDomainValid ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <div className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-extrabold block text-slate-850 dark:text-slate-200">2. BEd Non-Domain (Select {status.compulsoryNonDomainRequired})</span>
                      <span className="text-[10px] text-slate-450 block">Selected: {status.compulsoryNonDomainCount} / {status.compulsoryNonDomainRequired}</span>
                    </div>
                  </div>

                  {/* Language rule */}
                  <div className="flex items-start gap-2.5">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border ${
                      status.compulsoryLanguageValid ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-450"
                    }`}>
                      {status.compulsoryLanguageValid ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <div className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-extrabold block text-slate-850 dark:text-slate-200">3. BEd Languages (Select {status.compulsoryLanguageRequired})</span>
                      <span className="text-[10px] text-slate-450 block">Selected: {status.compulsoryLanguageCount} / {status.compulsoryLanguageRequired}</span>
                    </div>
                  </div>

                  {/* Optional Stream Domain rule */}
                  <div className="flex items-start gap-2.5">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border ${
                      status.optionalDomainValid ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-450"
                    }`}>
                      {status.optionalDomainValid ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <div className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" />}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-extrabold block text-slate-850 dark:text-slate-200">4. Optional Domain (Select {status.optionalDomainRequired})</span>
                      <span className="text-[10px] text-slate-450 block">Selected: {status.optionalDomainCount} / {status.optionalDomainRequired}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Final Submission Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="space-y-2 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Course Fee</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{coursePrice.toLocaleString("en-IN")}</span>
                  </div>
                  {course.testSeriesId && (
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Test Series Fee</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">₹{testSeriesPrice.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Coupon Discount</span>
                    <span className="font-bold text-emerald-600">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400">
                  <span>Total Amount</span>
                  <span className="text-base text-slate-900 dark:text-white font-black">₹{totalBatchPrice.toLocaleString("en-IN")}</span>
                </div>
                
                <button
                  disabled={!isValid || isSubmitting}
                  onClick={handleEnrollSubmit}
                  className={`w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                    isValid && !isSubmitting
                      ? "bg-violet-600 hover:bg-violet-700 text-white cursor-pointer hover:shadow"
                      : "bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <span>Confirm & Enroll</span>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting) return;
    if (!open) onClose();
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={!isModalBehaviorDisabled}>
        <SheetContent 
          side="bottom" 
          className="h-[75vh] max-h-[75vh] w-full overflow-y-auto rounded-t-[2rem] bg-slate-50 dark:bg-slate-950 p-6 border-t border-slate-200 dark:border-slate-850 select-none"
          onPointerDownOutside={(e) => { if (isSubmitting) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (isSubmitting) e.preventDefault(); }}
        >
          {wizardContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={!isModalBehaviorDisabled}>
      <DialogContent 
        className="w-[90vw] max-w-[90vw] sm:w-[80vw] sm:max-w-[80vw] md:w-[70vw] md:max-w-[70vw] lg:w-[60vw] lg:max-w-[60vw] xl:w-[60vw] xl:max-w-[60vw] max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-50 dark:bg-slate-950 p-6 md:p-8 border border-slate-200 dark:border-slate-850 shadow-2xl select-none"
        onPointerDownOutside={(e) => { if (isSubmitting) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (isSubmitting) e.preventDefault(); }}
      >
        {wizardContent}
      </DialogContent>
    </Dialog>
  );
}
