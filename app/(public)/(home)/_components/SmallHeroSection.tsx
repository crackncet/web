"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_IMAGES_MOBILE = [
  "/hero/mobile1.png",
  "/hero/mobile2.png",
  "/hero/mobile3.png",
];

function MobileAutoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES_MOBILE.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-muted">
      {HERO_IMAGES_MOBILE.map((src, index) => {
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
              alt={`Mobile Hero Background ${index + 1}`}
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

export default function SmallHeroSection() {
  return (
    <section className="relative w-full h-[100dvh] min-h-[600px] overflow-hidden block md:hidden">
      {/* 1. Auto-moving Background Carousel (Mobile Optimized) */}
      <MobileAutoCarousel />

      {/* 2. Radial Gradient Overlay */}
      {/* 
        Fades radially from the bottom-right corner to allow the image to 
        shine through on the top left.
      */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_100%_100%,var(--background)_0%,var(--background)_35%,transparent_85%)]" 
      />
      
      {/* Extra safety gradient at the bottom edge to ensure full text readability */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] z-10 pointer-events-none bg-gradient-to-t from-background/90 via-background/40 to-transparent" />

      {/* 3. Foreground Text Content (Bottom Aligned, Right Justified) */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 pb-12">
        <div className="w-full flex flex-col items-end text-right">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-4 backdrop-blur-sm shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary mr-2 animate-pulse"></span>
            Empowering Leaders
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15] mb-4">
            CRACK NCET WITH <br className="hidden sm:block" /><span className="text-primary">CONFIDENCE</span>
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed max-w-[90%] sm:max-w-[85%]">
            Join thousands of ambitious students who have successfully cleared the NCET with our comprehensive test series and expert guidance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
            <Link href="/courses" className="w-full sm:w-auto">
              <Button size="default" className="w-full sm:w-auto text-sm px-6 h-11 shadow-lg hover:shadow-primary/25 transition-all">
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/test-series" className="w-full sm:w-auto">
              <Button size="default" variant="outline" className="w-full sm:w-auto text-sm px-6 h-11 bg-background/50 backdrop-blur-sm border-border/50">
                Take a Mock Test
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-8 flex items-center justify-around gap-4 sm:gap-6 border-t border-border/40 pt-6 w-full sm:max-w-[90%]">
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">10k+</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Students</p>
            </div>
            <div className="w-px h-8 bg-border/40"></div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">50+</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Mentors</p>
            </div>
            <div className="w-px h-8 bg-border/40"></div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">95%</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Success</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}