"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_IMAGES = [
  "/hero/hero1.png",
  "/hero/hero2.png",
  "/hero/hero3.png",
];

function AutoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-muted">
      {HERO_IMAGES.map((src, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
          >
            <Image
              src={src}
              alt={`Hero Background ${index + 1}`}
              fill
              sizes="100vw"
              priority={index === 0}
              className={`object-cover object-center transition-transform duration-[10000ms] ease-linear origin-center ${
                isActive ? "scale-110" : "scale-100"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function LargeHeroSection() {
  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden hidden md:block">
      {/* 1. Auto-moving Background Carousel */}
      <AutoCarousel />

      {/* 2. Linear Gradient Overlay */}
      {/* 
        This elegant linear gradient fades from a completely solid background on the left 
        to a transparent reveal on the right. 
      */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-background from-[40%] via-background/80 via-[65%] to-transparent" />

      {/* 3. Foreground Text Content */}
      <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center w-[60%] lg:w-[50%] pl-10 lg:pl-20 pr-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary mb-6 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Empowering Future Leaders
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
            CRACK NCET WITH <span className="text-primary">CONFIDENCE</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Join thousands of ambitious students who have successfully cleared the NCET with our comprehensive test series, expert guidance, and smart analytics.
          </p>
          
          <div className="flex items-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="text-base px-8 h-12 shadow-lg hover:shadow-primary/25 transition-all">
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/test-series">
              <Button size="lg" variant="outline" className="text-base px-8 h-12 bg-background/50 backdrop-blur-sm border-border/50">
                Take a Mock Test
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-12 flex items-center gap-6 border-t border-border/40 pt-6">
            <div>
              <p className="text-3xl font-bold text-foreground">10k+</p>
              <p className="text-sm text-muted-foreground font-medium">Active Students</p>
            </div>
            <div className="w-px h-10 bg-border/40"></div>
            <div>
              <p className="text-3xl font-bold text-foreground">50+</p>
              <p className="text-sm text-muted-foreground font-medium">Expert Mentors</p>
            </div>
            <div className="w-px h-10 bg-border/40"></div>
            <div>
              <p className="text-3xl font-bold text-foreground">95%</p>
              <p className="text-sm text-muted-foreground font-medium">Success Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
