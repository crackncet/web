"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  label: string;
  value: number;
  color: string; // Tailwind class like "text-emerald-500" or hex color
  percentage: number;
}

interface DonutChartProps {
  title: string;
  data: DataPoint[];
  totalLabel: string;
  totalValue: number;
  className?: string;
}

export function DonutChart({
  title,
  data,
  totalLabel,
  totalValue,
  className,
}: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Filter out zero values to avoid rendering glitches, but keep them for the legend
  const activeSegments = data.filter((item) => item.value > 0);
  const totalActiveValue = activeSegments.reduce((sum, item) => sum + item.value, 0);

  let accumulatedPercent = 0;

  // SVG parameters
  const radius = 55;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn("space-y-4 bg-card p-5 rounded-2xl border border-border/60 shadow-sm", className)}>
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">
        {title}
      </h4>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Circle */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              className="stroke-muted/20"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {totalActiveValue > 0 ? (
              activeSegments.map((item) => {
                const percent = item.value / totalActiveValue;
                const strokeLength = percent * circumference;
                const strokeOffset = circumference - (accumulatedPercent * circumference);
                accumulatedPercent += percent;

                // Match segment to hovered index
                const originalIndex = data.findIndex((d) => d.label === item.label);
                const isHovered = activeIndex === originalIndex;

                return (
                  <circle
                    key={item.label}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-350 cursor-pointer"
                    onMouseEnter={() => setActiveIndex(originalIndex)}
                    onMouseLeave={() => setActiveIndex(null)}
                  />
                );
              })
            ) : (
              // If no data points > 0, draw an unattempted placeholder
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                className="stroke-muted-foreground/30"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={0}
              />
            )}
          </svg>

          {/* Centered text */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none rounded-full transition-all duration-300"
            style={{
              backgroundColor: activeIndex !== null ? `${data[activeIndex].color}08` : "transparent"
            }}
          >
            <span
              className="text-2xl font-black text-foreground transition-colors duration-300"
              style={{
                color: activeIndex !== null ? data[activeIndex].color : undefined
              }}
            >
              {activeIndex !== null ? data[activeIndex].value : totalValue}
            </span>
            <span
              className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide transition-colors duration-300"
              style={{
                color: activeIndex !== null ? data[activeIndex].color : undefined
              }}
            >
              {activeIndex !== null ? data[activeIndex].label : totalLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2 select-none">
          {data.map((item, index) => {
            const isHovered = activeIndex === index;
            return (
              <div
                key={item.label}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={cn(
                  "flex justify-between items-center text-xs font-semibold py-1 px-2.5 rounded-lg transition-colors cursor-pointer border border-transparent",
                  isHovered ? "bg-muted/60 border-border/50" : "hover:bg-muted/30"
                )}
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </span>
                <span className="text-foreground font-black text-right shrink-0">
                  {item.value} <span className="text-[9px] font-normal text-muted-foreground">({item.percentage.toFixed(0)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
