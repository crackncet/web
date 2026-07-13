"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-8 md:py-10 bg-slate-50 dark:bg-slate-950/40 mt-auto">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 pb-8 border-b border-border/20">
          
          {/* Left Block: Contact Info */}
          <div className="md:col-span-6 flex flex-col gap-4 items-center md:items-start text-center md:text-left">
            {/* Logo/Name */}
            <div className="flex items-center gap-2 select-none justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-light.png"
                alt="CrackNCET Logo"
                className="h-8 w-auto dark:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-dark.png"
                alt="CrackNCET Logo"
                className="h-8 w-auto hidden dark:block"
              />
              <span className="font-black text-lg tracking-wider text-slate-900 dark:text-slate-100 uppercase">
                Crack<span className="text-primary">NCET</span>
              </span>
            </div>

            {/* Address */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Indian Institute of Technology Kharagpur
                </p>
                <p>Kharagpur – 721302</p>
                <p>District: Paschim Medinipur</p>
                <p>West Bengal, India</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <a
                href="tel:+917063270418"
                className="font-semibold hover:text-primary transition-colors"
              >
                +91-7063270418
              </a>
            </div>

            {/* Email */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 text-sm text-slate-600 dark:text-slate-400">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <a
                href="mailto:admin@crackncet.com"
                className="font-semibold hover:text-primary transition-colors"
              >
                admin@crackncet.com
              </a>
            </div>
          </div>

          {/* Center Block: Quick Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-3 items-center md:items-start text-center md:text-left">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">
              Links
            </h4>
            <ul className="flex flex-col gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 items-center md:items-start">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/test-series" className="hover:text-primary transition-colors">
                  Test Series
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-primary transition-colors">
                  Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Block: Social Media */}
          <div className="md:col-span-3 flex flex-col gap-3 items-center md:items-start text-center md:text-left">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">
              Connect With Us
            </h4>
            <div className="flex flex-wrap gap-4 pt-1 justify-center md:justify-start">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center bg-sky-500/10 text-sky-500 dark:bg-sky-400/10 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-400 dark:hover:text-slate-950 border-2 border-slate-900 dark:border-slate-100 rounded-full transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/crack_ncet"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center bg-sky-500/10 text-sky-500 dark:bg-sky-400/10 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-400 dark:hover:text-slate-950 border-2 border-slate-900 dark:border-slate-100 rounded-full transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://www.instagram.com/crack_ncet"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="w-10 h-10 flex items-center justify-center bg-sky-500/10 text-sky-500 dark:bg-sky-400/10 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-400 dark:hover:text-slate-950 border-2 border-slate-900 dark:border-slate-100 rounded-full transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 -rotate-45 -translate-x-0.5 translate-y-0.5"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@CrackNCET"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 flex items-center justify-center bg-sky-500/10 text-sky-500 dark:bg-sky-400/10 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-400 dark:hover:text-slate-950 border-2 border-slate-900 dark:border-slate-100 rounded-full transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center text-center text-xs font-black tracking-wider text-muted-foreground uppercase gap-2 select-none">
          <span>CrackNCET 2026</span>
          <span className="hidden sm:inline">|</span>
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
