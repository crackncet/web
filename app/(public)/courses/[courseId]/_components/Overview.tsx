import React, { useState } from "react";
import { useParams } from "next/navigation";
import { usePublicCourseDetailQuery } from "../_queries/courseDetail.queries";
import { BookOpen, Check, Play, Clock, Trophy, FileText, FileQuestion, Users, Sparkles, AlertCircle, ArrowUpRight, Video, Clipboard, ListTodo, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

export function Overview() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { data: course, isLoading, error } = usePublicCourseDetailQuery(courseId);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 bg-muted w-24 rounded" />
          <div className="h-8 bg-muted w-48 rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-muted rounded w-full" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-3xl" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
        <AlertCircle className="h-8 w-8 text-slate-350 mb-2" />
        <p className="text-xs font-semibold">Failed to load course overview data.</p>
      </div>
    );
  }

  const totalHours = course.videoDurationMinutes ? Math.ceil(course.videoDurationMinutes / 60) : 0;
  const videos = course.demoVideos || [];
  const activeVideo = activeVideoUrl || (videos.length > 0 ? videos[0] : null);

  const benefits = [
    "Complete Syllabus coverage from basic to advanced levels",
    "Exhaustive collection of Daily Practice Problems (DPPs) with video solutions",
    "Attached All India Rank (AIR) mock test series included free",
    "Chapter-wise detailed study notes and quick revision notes",
    "Practice question banks for every chapter to refine speed and accuracy",
    "Live lectures & interactive doubt sessions by top-tier IITian mentors",
  ];

  return (
    <div className="space-y-10">
      
      {/* 1. What You Get (Green Ticks Benefits List) */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 block">
            COURSE BENEFITS
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight mt-1">
            What you'll get in this course
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="h-5 w-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40 shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed">
                {benefit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Demo Videos Section (if any) */}
      {videos.length > 0 && activeVideo && (
        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-900/60">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-550 block">
              DEMO LECTURES
            </span>
            <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
              Watch demo lectures from top instructors and evaluate the teaching style.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2 aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 relative group">
              <video
                key={activeVideo}
                src={activeVideo}
                controls
                className="w-full h-full object-cover"
                poster={course.banner || undefined}
              />
            </div>

            {/* Playlist Sidebar */}
            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {videos.map((vidUrl, index) => {
                const isActive = activeVideo === vidUrl;
                const fileName = vidUrl.split("/").pop() || `Lecture Demo ${index + 1}`;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveVideoUrl(vidUrl)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      isActive
                        ? "bg-violet-50/50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900/60"
                        : "bg-transparent border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                    }`}
                  >
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? "bg-violet-500 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      <Play className="h-3 w-3 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isActive ? "text-violet-750 dark:text-violet-400" : "text-slate-700 dark:text-slate-300"}`}>
                        Demo Class #{index + 1}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5 max-w-[200px]">
                        {fileName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Detailed Course Material & Resource Overview (Non-card Layout) */}
      <div className="space-y-8 pt-6 border-t border-slate-100 dark:border-slate-900/60">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 block">
            DETAILED CONTENT OVERVIEW
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight mt-1">
            Complete list of resources included
          </h3>
          <p className="text-xs text-slate-405 dark:text-slate-500 mt-1">
            A comprehensive visual display of exactly what resources are bundled with this training package.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Section A: Lectures & Classes */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-900">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Video className="h-4 w-4 text-purple-600" />
                Lectures & Video Classes
              </h4>
            </div>
            
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    {totalHours || "100+"} Hours of Video Content
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    High-quality conceptual recordings covering all subjects.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    {course.videoLectureCount || 0} Video Chapters
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    Syllabus topics divided into bite-sized lessons.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    {course.liveLectureCount || 0} Live Interactive Classes
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    Real-time session discussion & instant doubt resolution.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Section B: Study Material & Exercises */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-900">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-600" />
                Practice & Revision Notes
              </h4>
            </div>

            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    {course.dppCount || 0} Daily Practice Sheets
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    Topic worksheets to solidify lecture learning.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    {course.chapterNotesCount || 0} Chapter Study Notes
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    Comprehensive PDF notes prepared by top faculties.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    {course.topicNotesCount || 0} Topic Revision Sheets
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    Handy summaries containing core formulas and templates.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Section C: Testing & Assessment */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-900">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-indigo-600" />
                Testing & Mock Series
              </h4>
            </div>

            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-650 shrink-0 mt-1.5" />
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    {course.testCount || 0} Mock Test Papers
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    Timed exam practice sessions with comprehensive reports.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-655 shrink-0 mt-1.5" />
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    {course.chapterQuestionBankCount || 0} Chapter Practice Banks
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    Full catalog of questions filtered by chapter.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-655 shrink-0 mt-1.5" />
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                    {course.mentorCount || 0} Assigned Subject Mentors
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                    Experienced mentors monitoring and tracking your progress.
                  </span>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Success Banner */}
      <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-955 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-9 w-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100/40 dark:border-violet-900/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
              Your success is our priority
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              We're with you at every step of your journey.
            </p>
          </div>
        </div>

        <button className="w-full sm:w-auto h-9 px-4.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all">
          Let's get started
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  );
}
