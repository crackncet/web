import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] flex flex-col">
      <Navbar />
      
      {/* Detached, rounded content card layout */}
      <div className="flex-1 w-full max-w-9xl mx-auto px-2 pt-15 flex flex-col">
        <div className="flex-1 w-full mt-3 bg-white dark:bg-[#0d1324] border border-slate-200/60 dark:border-slate-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] rounded-t-3xl overflow-hidden flex flex-col">
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
