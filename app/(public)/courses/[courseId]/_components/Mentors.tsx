import React from "react";
import Image from "next/image";
import { Users, GraduationCap, BookOpen } from "lucide-react";
import { PublicStreamMentors } from "../_api/courseDetail.api";
import { cn } from "@/lib/utils";

interface MentorsProps {
  streamMentors: PublicStreamMentors[] | undefined;
  isLoading: boolean;
}

export function Mentors({ streamMentors, isLoading }: MentorsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Users className="h-5 w-5 text-violet-600" />
          Meet Your Mentors
        </h3>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          Learn from top IITians and experienced educators assigned to your subjects.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-3xl" />
          ))}
        </div>
      ) : !streamMentors || streamMentors.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
          <Users className="h-10 w-10 text-slate-350 mb-2" />
          <p className="text-xs font-semibold">No mentor data available for this course yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {streamMentors.map((stream) => {
            // Flatten mentors across all subjects in the stream to display them in a clean grid
            const mentorsInStream = stream.subjects.flatMap((subj) =>
              subj.mentors.map((mentor) => ({
                ...mentor,
                subjectName: subj.subjectName,
              }))
            );

            if (mentorsInStream.length === 0) return null;

            return (
              <div key={stream.streamId} className="space-y-4">
                <h4 className="inline-flex px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700">
                  {stream.streamName}
                </h4>

                <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-6 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-thin">
                  {mentorsInStream.map((mentor, idx) => (
                    <div 
                      key={`${mentor.name}-${mentor.subjectName}-${idx}`} 
                      className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 flex items-start gap-4 transition-all hover:shadow-xs w-[280px] sm:w-[320px] md:w-auto shrink-0 md:shrink-1 snap-center"
                    >
                      {/* Left side: Large rounded square photo box */}
                      <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700 shrink-0 shadow-inner">
                        {mentor.profileImage ? (
                          <Image
                            src={mentor.profileImage}
                            alt={mentor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-violet-500/10 to-indigo-500/20 flex items-center justify-center font-black text-violet-755 text-lg">
                            {mentor.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Right side stack details */}
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <span className="text-sm md:text-base font-extrabold text-slate-900 dark:text-slate-50 truncate">
                          {mentor.name}
                        </span>
                        
                        <span className="text-[11px] font-semibold text-slate-450 dark:text-slate-400 mt-1.5 flex items-center gap-1.5 truncate">
                          <GraduationCap className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                          {mentor.college}
                        </span>

                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-350 mt-1 flex items-center gap-1.5 truncate">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          {mentor.subjectName}
                        </span>

                        {/* Role Badge */}
                        <div className="mt-3">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                            mentor.role === "TEACHER"
                              ? "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                          )}>
                            {mentor.role === "TEACHER" ? "Teacher" : "TA"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
