import React from "react";
import { Check, Trophy, LineChart, Play, Monitor, Globe, Award, Sparkles, ArrowUpRight } from "lucide-react";

interface OverviewProps {
  onEnrollClick?: () => void;
}

export function Overview({ onEnrollClick }: OverviewProps) {
  const marketingFeatures = [
    {
      icon: <Monitor className="h-6 w-6 text-violet-600 dark:text-violet-400" />,
      title: "Real Exam CBT Mode",
      description: "Experience tests in a Computer Based Test environment identical to the official NTA NCET exam, featuring exact section selectors, color-coded status, and calculator widgets.",
    },
    {
      icon: <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: "All India Mock Tests",
      description: "Compete live with thousands of aspirants nationwide. Real-time test schedules simulate the high pressure of the real exam day.",
    },
    {
      icon: <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      title: "All India Leaderboard",
      description: "Compare your performance instantly with top rankers. Access rankings, raw scores, and percentile statistics to know where you stand.",
    },
    {
      icon: <LineChart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Deep Performance Analysis",
      description: "Get granular insights on accuracy, time spent per question, topic-wise strengths and weaknesses, and personalized remediation tips.",
    },
    {
      icon: <Play className="h-6 w-6 text-red-600 dark:text-red-400" />,
      title: "Video Solution Sessions",
      description: "Step-by-step video solutions and post-exam review lectures. Learn short-cut methodologies and key error-avoidance strategies from top faculty.",
    },
    {
      icon: <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      title: "High-Yield Subject Tests",
      description: "Curated by IITians and top educators following the exact NCET syllabus, ensuring no surprises on the final exam sheet.",
    },
  ];

  return (
    <div className="space-y-10 select-none">
      
      {/* Overview Intro */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 block">
          TEST SERIES OVERVIEW
        </span>
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight mt-1">
          Why choose this NCET practice series?
        </h3>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1.5 leading-relaxed">
          Prepare effectively with our state-of-the-art testing platform. Designed to replicate NTA guidelines exactly, this program ensures you build stamina, precision, and concept mastery.
        </p>
      </div>

      {/* Grid of Marketing Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {marketingFeatures.map((feat, idx) => (
          <div 
            key={idx} 
            className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
          >
            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-850 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/40 dark:border-slate-800">
              {feat.icon}
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-violet-600 transition-colors">
                {feat.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Success Banner */}
      <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-955 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-9 w-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100/40 dark:border-violet-900/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
              Excel in NTA NCET with Confidence
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Join thousands of students aiming for top central universities.
            </p>
          </div>
        </div>

        {onEnrollClick && (
          <button 
            onClick={onEnrollClick}
            className="w-full sm:w-auto h-9 px-4.5 bg-violet-600 hover:bg-violet-755 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
          >
            Enroll Now
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}
