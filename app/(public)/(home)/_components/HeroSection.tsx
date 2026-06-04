"use client";

import React, { SVGProps } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps extends SVGProps<SVGSVGElement> {}

// --- IIT LOGOS ---

function IITKharagpurLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <g transform="translate(50, 50)">
        {[...Array(16)].map((_, i) => (
          <rect
            key={i}
            x="-2"
            y="-46"
            width="4"
            height="8"
            rx="1.2"
            fill="currentColor"
            stroke="none"
            transform={`rotate(${i * 22.5})`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="41" strokeWidth="2" />
      <circle cx="50" cy="50" r="33" strokeWidth="1" />
      <path
        d="M50 72 V50 M44 60 C38 60 34 56 34 50 C34 44 40 40 44 42 C42 36 46 30 52 30 C58 30 62 34 62 40 C66 40 70 44 70 50 C70 56 66 60 60 60 Z"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M42 70 L50 72 L58 70 V75 L50 77 L42 75 Z" strokeWidth="1" />
      <path d="M26 80 Q50 84 74 80" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IITBombayLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <g transform="translate(50, 50)" fill="currentColor" stroke="none">
        {[...Array(16)].map((_, i) => (
          <path
            key={i}
            d="M0 -45 C-3.5 -38 0 -34 0 -34 C0 -34 3.5 -38 0 -45 Z"
            transform={`rotate(${i * 22.5})`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="33" strokeWidth="2" />
      <circle cx="50" cy="50" r="27" strokeWidth="1" />
      <path d="M38 52 C38 45 42 41 50 41 C58 41 62 45 62 52 Z" strokeWidth="1" />
      <path d="M50 41 V35 M44 43 L39 38 M56 43 L61 38" strokeWidth="1" strokeLinecap="round" />
      <path d="M50 52 V64" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 72 Q50 68 68 72" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IITDelhiLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M26 22 H74 V56 C74 70 50 84 50 84 C50 84 26 70 26 56 Z" strokeWidth="2.5" />
      <path d="M50 36 C47 44 50 52 50 52 C50 52 53 44 50 36 Z" fill="currentColor" stroke="none" />
      <path d="M38 40 V62 H42 V40 Z" fill="currentColor" stroke="none" />
      <path d="M58 40 V62 H62 V40 Z" fill="currentColor" stroke="none" />
      <path d="M32 30 Q50 26 68 30" strokeWidth="1.2" />
      <path d="M34 70 Q50 76 66 70" strokeWidth="1.2" />
    </svg>
  );
}

function IITMadrasLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="50" cy="50" r="41" strokeWidth="2" />
      <circle cx="50" cy="50" r="33" strokeWidth="1" />
      <path d="M43 38 H57 V56 C57 62 50 68 50 68 C50 68 43 62 43 56 Z" strokeWidth="1.5" />
      <path d="M27 60 C26 48 32 40 38 44" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="29" cy="45" r="1.5" fill="currentColor" stroke="none" />
      <path d="M73 60 C74 48 68 40 62 44" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="71" cy="45" r="1.5" fill="currentColor" stroke="none" />
      <path d="M28 78 Q50 74 72 78" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IITKanpurLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="50" cy="50" r="40" strokeWidth="2" />
      <circle cx="50" cy="50" r="32" strokeWidth="1" />
      <path d="M50 30 C46 38 46 50 50 56 C54 50 54 38 50 30 Z" fill="currentColor" stroke="none" />
      <path d="M32 66 A22 22 0 0 0 68 66" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="36" y1="68" x2="33" y2="73" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="43" y1="71" x2="41" y2="77" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="72" x2="50" y2="78" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="57" y1="71" x2="59" y2="77" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="64" y1="68" x2="67" y2="73" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IITRoorkeeLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="50" cy="50" r="41" strokeWidth="2" />
      <path d="M36 32 H64 V56 C64 66 50 74 50 74 C50 74 36 66 36 56 Z" strokeWidth="1.5" />
      <path d="M40 50 Q50 46 60 50 V60 Q50 56 40 60 Z" strokeWidth="1.2" />
      <line x1="50" y1="48" x2="50" y2="58" strokeWidth="1.2" />
      <circle cx="50" cy="40" r="5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// --- NIT LOGOS ---

function NITTrichyLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="50" cy="50" r="41" strokeWidth="2" />
      <circle cx="50" cy="50" r="33" strokeWidth="1" />
      <path d="M43 64 H57 L54 36 H46 Z" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="44.5" y1="52" x2="55.5" y2="52" />
      <line x1="45.5" y1="44" x2="54.5" y2="44" />
      <path d="M50 36 V30 M47 30 H53" strokeWidth="1.2" />
      <path d="M36 70 A20 20 0 0 0 64 70" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function NITSurathkalLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="50" cy="50" r="41" strokeWidth="2" />
      <circle cx="50" cy="50" r="33" strokeWidth="1" />
      <path d="M47 62 L49 36 H51 L53 62 Z" strokeWidth="1.5" fill="currentColor" />
      <path d="M49 38 L32 30 M51 38 L68 30" strokeWidth="1" strokeDasharray="2,2" />
      <path d="M35 66 Q42 63 50 66 Q58 69 65 66" strokeWidth="1.2" />
    </svg>
  );
}

function NITRourkelaLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="50" cy="50" r="41" strokeWidth="2" />
      <circle cx="50" cy="50" r="34" strokeWidth="1" />
      <g transform="translate(50,50)">
        {[...Array(8)].map((_, i) => (
          <path
            key={i}
            d="M0 -22 L3 -10 L14 -10 L6 -2 L10 10 L0 3 L-10 10 L-6 -2 L-14 -10 L-3 -10 Z"
            transform={`rotate(${i * 45})`}
            strokeWidth="1.2"
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="8" fill="currentColor" stroke="none" />
    </svg>
  );
}

// --- RIE LOGOS ---

function RIEMysoreLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="50" cy="50" r="41" strokeWidth="2" />
      <circle cx="50" cy="50" r="33" strokeWidth="1" />
      <path d="M50 34 C44 34 42 42 42 46 C42 54 50 64 50 64 C50 64 58 54 58 46 C58 42 56 34 50 34 Z" strokeWidth="1.5" />
      <path d="M50 38 C47 38 46 41 46 44 C46 49 50 55 50 55 C50 55 54 49 54 44 C54 41 53 38 50 38 Z" fill="currentColor" stroke="none" />
      <path d="M38 46 C32 44 28 50 28 54 C28 62 38 70 38 70 C38 70 44 60 44 54 C44 50 42 46 38 46 Z" strokeWidth="1.2" />
      <path d="M62 46 C68 44 72 50 72 54 C72 62 62 70 62 70 C62 70 56 60 56 54 C56 50 58 46 62 46 Z" strokeWidth="1.2" />
    </svg>
  );
}

function RIEBhubaneswarLogo(props: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M50 8 L85 28 V72 L50 92 L15 72 V28 Z" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M50 14 L78 30 V70 L50 86 L22 70 V30 Z" strokeWidth="1.2" strokeLinejoin="round" />
      <g transform="translate(0, 4)">
        <path d="M50 34 C44 34 42 42 42 46 C42 54 50 64 50 64 C50 64 58 54 58 46 C58 42 56 34 50 34 Z" strokeWidth="1.5" />
        <path d="M38 46 C32 44 28 50 28 54 C28 62 38 70 38 70 C38 70 44 60 44 54 C44 50 42 46 38 46 Z" strokeWidth="1.2" />
        <path d="M62 46 C68 44 72 50 72 54 C72 62 62 70 62 70 C62 70 56 60 56 54 C56 50 58 46 62 46 Z" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

const INSTITUTES = [
  { name: "IIT Kanpur", logo: IITKanpurLogo },
  { name: "IIT Roorkee", logo: IITRoorkeeLogo },
  { name: "NIT Trichy", logo: NITTrichyLogo },
  { name: "NIT Surathkal", logo: NITSurathkalLogo },
  { name: "NIT Rourkela", logo: NITRourkelaLogo },
  { name: "RIE Mysore", logo: RIEMysoreLogo },
  { name: "RIE Bhubaneswar", logo: RIEBhubaneswarLogo },
  { name: "IIT Kharagpur", logo: IITKharagpurLogo },
  { name: "IIT Bombay", logo: IITBombayLogo },
  { name: "IIT Delhi", logo: IITDelhiLogo },
  { name: "IIT Madras", logo: IITMadrasLogo },
];

export default function HeroSection() {
  const listItems = [...INSTITUTES, ...INSTITUTES];



  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-between bg-gradient-to-b from-background via-slate-50/20 to-background dark:from-background dark:via-slate-950/10 dark:to-background overflow-hidden py-8 md:py-12">
      {/* Background Drawings - Responsive placeholders */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-5 transition-opacity duration-500">
        <Image
          src="/hero/education_hero_bg_mobile.png"
          alt="Educational Pattern Mobile"
          fill
          sizes="100vw"
          priority
          className="object-contain md:hidden"
        />
        <Image
          src="/hero/education_hero_bg_desktop.png"
          alt="Educational Pattern Desktop"
          fill
          sizes="100vw"
          priority
          className="object-contain hidden md:block"
        />
      </div>

      {/* Top logo display */}
      <div className="relative z-10 w-full flex justify-center mb-8 md:mb-12 select-none">
        <Image
          src="/logo-light.png"
          alt="CrackNCET Logo"
          width={224}
          height={64}
          priority
          className="h-12 sm:h-16 w-auto dark:hidden transition-all duration-300"
        />
        <Image
          src="/logo-dark.png"
          alt="CrackNCET Logo"
          width={224}
          height={64}
          priority
          className="h-12 sm:h-16 w-auto hidden dark:block transition-all duration-300"
        />
      </div>

      {/* Center aligned Core Info Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center my-auto flex flex-col items-center">
        <span className="text-xs sm:text-sm font-black text-primary tracking-[0.2em] uppercase mb-4 py-1.5 px-3.5 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm animate-fade-in">
          LEARN FROM THE BEST
        </span>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-[1.15] mb-6 max-w-3xl">
          Secure Your Seat in India’s Top{" "}
          <span className="text-primary">
            IITs, NITs & RIEs
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl mb-10">
          Get the only NCET preparation course taught by actual IITians. Learn and excel
          with modern test patterns, chapter materials, and interactive support.
        </p>

        {/* CTA Button with Wireframe Offset shadow effect */}
        <div className="relative group mb-16">
          <div className="absolute inset-0 bg-primary/15 rounded-xl border-2 border-slate-900 dark:border-slate-100 translate-x-1.5 translate-y-1.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 pointer-events-none" />
          <Link href="/courses">
            <button
              className="relative flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-black text-sm uppercase border-2 border-slate-900 dark:border-slate-100 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>

      {/* Integrated Institutes Infinite Carousel (Reduced Header Size) */}
      <div className="relative z-10 w-full mt-auto">
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="text-center mb-6">
          <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest">
            Secure your seat in
          </p>
        </div>

        {/* Carousel Track Container */}
        <div className="w-full relative flex items-center overflow-hidden py-2 select-none">
          <div className="animate-marquee-loop">
            {listItems.map((inst, index) => {
              const LogoComponent = inst.logo;
              return (
                <div
                  key={`${inst.name}-${index}`}
                  className="flex items-center justify-center text-center gap-2 mx-6 md:mx-10 shrink-0 group transition-all duration-300"
                >
                  {/* Logo Frame */}
                  <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-indigo-950/60 dark:text-indigo-200/60 transition-all duration-300 group-hover:scale-105 group-hover:text-primary">
                    <LogoComponent className="w-full h-full object-contain" />
                  </div>

                  {/* College Name */}
                  <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap tracking-wide transition-colors duration-300 group-hover:text-primary">
                    {inst.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CSS infinite animation styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes marquee-scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee-loop {
            display: flex;
            width: max-content;
            animation: marquee-scroll 35s linear infinite;
          }
          .animate-marquee-loop:hover {
            animation-play-state: paused;
          }
        `
      }} />
    </section>
  );
}
