"use client";

import React from "react";
import { Award, Trophy, Users, TrendingUp, Check } from "lucide-react";

export default function ResultSection() {
  return (
    <section className="relative w-full pt-8 md:pt-12 bg-gradient-to-b from-background to-slate-50/30 dark:to-slate-950/10 overflow-hidden">
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
            <div className="relative group w-full max-w-2xl">
              {/* Offset Shadow Layer */}
              <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5 rounded-[24px] border-2 border-slate-900 dark:border-slate-100 translate-x-3 translate-y-3 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2 pointer-events-none" />
              
              {/* Video Frame */}
              <div className="relative w-full aspect-video rounded-[24px] border-2 border-slate-900 dark:border-slate-100 overflow-hidden bg-black shadow-lg">
                
                <iframe
                  className="w-full h-full border-0"
                  src="https://www.youtube.com/embed/QeJe3ijE-RU"
                  title="Koushik | NIT Jalandhar | Proud Student of Crack NCET"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
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

        {/* Student Achievements Card Container */}
        <div className="mt-20 md:mt-28 w-full max-w-6xl mx-auto">
          <div className="relative group">
            {/* Offset Shadow Layer */}
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/5 rounded-[32px] border-2 border-slate-900 dark:border-slate-100 translate-x-3 translate-y-3 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2 pointer-events-none" />
            
            {/* Main Achievements Card */}
            <div className="relative bg-background border-2 border-slate-900 dark:border-slate-100 p-8 md:p-12 rounded-[32px] shadow-sm flex flex-col items-center">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-7 h-7 md:w-9 md:h-9 text-amber-500 animate-pulse" />
                <h3 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 text-center">
                  Student Achievements
                </h3>
              </div>
              
              <p className="text-sm md:text-base text-muted-foreground text-center max-w-2xl mb-10">
                Our students have consistently outperformed expectations, claiming top spots in national ranks. Here's a glimpse of our legacy in the NCET examination:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
                {/* Stat 1 */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 border border-border/60 hover:border-primary/40 rounded-2xl text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Top 10</h4>
                  <p className="text-xs md:text-sm text-muted-foreground font-semibold mt-1">Students in Top 10</p>
                </div>

                {/* Stat 2 */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 border border-border/60 hover:border-primary/40 rounded-2xl text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Top 100</h4>
                  <p className="text-xs md:text-sm text-muted-foreground font-semibold mt-1">Students in Top 100</p>
                </div>

                {/* Stat 3 */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 border border-border/60 hover:border-primary/40 rounded-2xl text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Top 500</h4>
                  <p className="text-xs md:text-sm text-muted-foreground font-semibold mt-1">Students in Top 500</p>
                </div>

                {/* Stat 4 */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 border border-border/60 hover:border-primary/40 rounded-2xl text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Top 1000</h4>
                  <p className="text-xs md:text-sm text-muted-foreground font-semibold mt-1">Students in Top 1000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}