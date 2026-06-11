import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";

interface CourseHeroProps {
  title: string;
  description: string | null;
  banner: string | null;
  streams: string[];
  startDate: string | null;
}

export function CourseHero({ title, description, banner, streams, startDate }: CourseHeroProps) {
  const formattedStartDate = startDate
    ? new Date(startDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Flexible Start";

  return (
    <section className="relative w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white py-10 md:py-14 border-b border-slate-850 overflow-hidden select-none">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full relative z-10">
        {/* Back link */}
        <div className="mb-4">
          <Link 
            href="/courses" 
            className="group inline-flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to courses
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
          {/* Banner container */}
          <div className="relative aspect-video w-full md:w-72 overflow-hidden bg-slate-900 rounded-2xl border border-white/10 shrink-0">
            {banner ? (
              <Image
                src={banner}
                alt={title}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/10 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-violet-400/40 animate-pulse" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between self-stretch py-1">
            <div>
              <h1 className="text-xl md:text-3xl font-black tracking-tight leading-tight mb-2.5">
                {title}
              </h1>
              {description && (
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-3xl line-clamp-3">
                  {description}
                </p>
              )}
            </div>

            {/* Bottom metadata */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap gap-1.5">
                {streams.map((stream) => (
                  <span 
                    key={stream}
                    className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/10"
                  >
                    {stream}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Calendar className="h-4 w-4 text-violet-400" />
                <span>Batch starts: {formattedStartDate}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
