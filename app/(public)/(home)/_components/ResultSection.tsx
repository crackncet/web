"use client";

import React from "react";
import { Check, Tv, MessageSquareText } from "lucide-react";
import { RetroCard } from "@/components/ui/retro-card";

export default function ResultSection() {
  return (
    <section className="relative w-full py-8 md:py-12 bg-gradient-to-b from-background to-slate-50/30 dark:to-slate-950/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-20">
          <p className="text-sm md:text-base font-semibold text-primary tracking-widest uppercase mb-2">
            The Proof is in the Results
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Meet the NCET <span className="text-primary">Rankers</span>
          </h2>
        </div>

        {/* Video & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Side: Video Container with Retro Offset Shadow */}
          <div className="lg:col-span-7 w-full flex justify-center items-center">
            <RetroCard
              containerClassName="max-w-2xl"
              className="aspect-video bg-black shadow-lg"
              shadowClassName="bg-primary/10 dark:bg-primary/5"
              isHoverable={false}
            >
              <iframe
                className="w-full h-full border-0"
                src="https://www.youtube.com/embed/QeJe3ijE-RU"
                title="Koushik | NIT Jalandhar | Proud Student of Crack NCET"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </RetroCard>
          </div>

          {/* Right Side: Text & Features Content */}
          <div className="lg:col-span-5 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
              Clarity, Confidence & Success in NCET
            </h3>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
              See how our students gained a crystal-clear understanding of concepts and the exact confidence needed to crack the NCET. With a step-by-step teaching approach, even the toughest topics became easy to learn. Through proven strategies and continuous guidance, they stayed motivated, maintained consistency, and pushed themselves to secure their dream rank.
            </p>

            {/* Achievements Bullet List */}
            <div className="space-y-4 w-full max-w-md lg:max-w-none text-left">
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300">
                  Step-by-step conceptual teaching approach
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300">
                  Weekly reviews & doubt solving sessions
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300">
                  Simulated full-length Computer Based Tests
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why 1000+ Students Trust Us Section */}
        <div className="mt-20 md:mt-28 w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Why 1000+ Students Trust Us for NCET
            </h3>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Live + Recorded Classes */}
            <div className="relative group w-full flex">
              <div className="absolute inset-0 bg-[#00aeef]/10 dark:bg-[#00aeef]/5 rounded-[24px] border-2 border-slate-900 dark:border-slate-100 translate-x-2 translate-y-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 pointer-events-none" />
              <div className="relative flex flex-col w-full bg-background border-2 border-slate-900 dark:border-slate-100 rounded-[24px] p-8 text-center items-center">
                <div className="w-16 h-16 rounded-full bg-[#00aeef]/10 text-[#00aeef] border border-[#00aeef]/20 flex items-center justify-center mb-6">
                  <Tv className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
                  Live + Recorded Classes
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Study Without Skipping School. Missed a live class? No problem. Get instant access to recorded lectures so you can balance board exams and NCET prep seamlessly.
                </p>
              </div>
            </div>

            {/* Card 2: 1-to-1 Mentorship */}
            <div className="relative group w-full flex">
              <div className="absolute inset-0 bg-[#00aeef]/10 dark:bg-[#00aeef]/5 rounded-[24px] border-2 border-slate-900 dark:border-slate-100 translate-x-2 translate-y-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 pointer-events-none" />
              <div className="relative flex flex-col w-full bg-background border-2 border-slate-900 dark:border-slate-100 rounded-[24px] p-8 text-center items-center">
                <div className="w-16 h-16 rounded-full bg-[#00aeef]/10 text-[#00aeef] border border-[#00aeef]/20 flex items-center justify-center mb-6">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M19 8a3 3 0 0 1 0 6" />
                    <path d="M22 6a6 6 0 0 1 0 10" />
                  </svg>
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
                  1-to-1 Mentorship
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Direct Mentorship from IITians. You aren&apos;t just buying videos. You get 1-on-1 guidance from mentors who have already cracked India&apos;s toughest exams.
                </p>
              </div>
            </div>

            {/* Card 3: 24x7 Support System */}
            <div className="relative group w-full flex">
              <div className="absolute inset-0 bg-[#00aeef]/10 dark:bg-[#00aeef]/5 rounded-[24px] border-2 border-slate-900 dark:border-slate-100 translate-x-2 translate-y-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1 pointer-events-none" />
              <div className="relative flex flex-col w-full bg-background border-2 border-slate-900 dark:border-slate-100 rounded-[24px] p-8 text-center items-center">
                <div className="w-16 h-16 rounded-full bg-[#00aeef]/10 text-[#00aeef] border border-[#00aeef]/20 flex items-center justify-center mb-6">
                  <MessageSquareText className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
                  24x7 Support System
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instant Doubt Clearing. Stuck on a tricky Teaching Aptitude question at 11 PM? Drop it in the chat and get it resolved before you sleep.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}