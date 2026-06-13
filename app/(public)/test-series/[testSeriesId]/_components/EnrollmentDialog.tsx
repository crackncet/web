import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { PublicTestSeriesDetail } from "../_api/test-series-detail.api";
import { Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useUser } from "@/hooks/use-user";
import LoginDialog from "@/components/dialogs/LoginDialog";

interface EnrollmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  testSeries: PublicTestSeriesDetail;
}

export function EnrollmentDialog({ isOpen, onClose, testSeries }: EnrollmentDialogProps) {
  const { data: user, isLoading: isUserLoading } = useUser();

  const priceNum = parseFloat(testSeries.price) || 0;
  const couponDiscount = 0; // Dummy coupon discount (for future implementation)
  const totalAmount = priceNum - couponDiscount;

  // States
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
      setEnrollmentSuccess(false);
      setIsModalBehaviorDisabled(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Submit enrollment selection
  const handleEnrollSubmit = async () => {
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
        itemType: "TEST_SERIES",
        referenceId: testSeries.id,
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
        description: `Enrollment for ${testSeries.name}`,
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
    <div className="w-full h-full text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {isUserLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-xs font-bold text-slate-500 tracking-wide">Checking authentication status...</p>
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
            <p className="text-slate-555 dark:text-slate-400 max-w-md mx-auto text-sm">
              Please sign in to buy the test series <strong className="text-slate-800 dark:text-slate-200">{testSeries.name}</strong>.
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
              You have successfully enrolled in <strong className="text-slate-850 dark:text-slate-200">{testSeries.name}</strong>. Welcome to the series!
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
              Buy {testSeries.name}
            </h3>
            <p className="text-slate-550 dark:text-slate-400 text-xs mt-1.5">
              Confirm details and proceed to secure Razorpay checkout gateway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left side: Student prefills */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b pb-2 border-slate-100 dark:border-slate-800">
                Aspirant Details
              </span>
              <div className="space-y-3.5 text-xs font-semibold text-slate-650 dark:text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Name</span>
                  <span className="text-slate-800 dark:text-white font-bold">{user.fullName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Email</span>
                  <span className="text-slate-800 dark:text-white font-bold">{user.email}</span>
                </div>
                
              </div>
            </div>

            {/* Right side: Payment summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b pb-2 border-slate-100 dark:border-slate-800">
                Payment Summary
              </span>
              <div className="space-y-2 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Base Price</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{priceNum.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Coupon Discount</span>
                  <span className="font-bold text-emerald-600">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400">
                <span>Total Amount</span>
                <span className="text-base text-slate-900 dark:text-white font-black">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
              
              <button
                disabled={isSubmitting}
                onClick={handleEnrollSubmit}
                className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm & Pay</span>
                )}
              </button>
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
          className="h-[65vh] max-h-[65vh] w-full overflow-y-auto rounded-t-[2rem] bg-slate-50 dark:bg-slate-950 p-6 border-t border-slate-200 dark:border-slate-850 select-none"
          onPointerDownOutside={(e) => { if (isSubmitting) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (isSubmitting) e.preventDefault(); }}
        >
          <SheetTitle className="sr-only">Buy {testSeries.name}</SheetTitle>
          <SheetDescription className="sr-only">Confirm details to pay and join test series.</SheetDescription>
          {wizardContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={!isModalBehaviorDisabled}>
      <DialogContent 
        className="w-[90vw] max-w-[90vw] sm:w-[80vw] sm:max-w-[80vw] md:w-[70vw] md:max-w-[70vw] lg:w-[50vw] lg:max-w-[50vw] xl:w-[50vw] xl:max-w-[50vw] max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-50 dark:bg-slate-955 p-6 md:p-8 border border-slate-200 dark:border-slate-850 shadow-2xl select-none"
        onPointerDownOutside={(e) => { if (isSubmitting) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (isSubmitting) e.preventDefault(); }}
      >
        <DialogTitle className="sr-only">Buy {testSeries.name}</DialogTitle>
        <DialogDescription className="sr-only">Confirm details to pay and join test series.</DialogDescription>
        {wizardContent}
      </DialogContent>
    </Dialog>
  );
}
