"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  label: string;
  value: number;
  color: string;
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

  const totalQuestions = data.reduce((sum, item) => sum + item.value, 0);
  const chartTotal = totalQuestions > 0 ? totalQuestions : 1;
  const activeSegments = data.filter((item) => item.value > 0);

  let accumulatedPercent = 0;

  const radius = 32.5;
  const strokeWidth = 65;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn("space-y-4 bg-card p-5 rounded-2xl border border-border/60 shadow-sm", className)}>
      <div className="flex justify-between items-center select-none">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wide">
          Pie Chart View
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Pie Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            {/* Background circle if empty */}
            {totalQuestions === 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                className="stroke-muted-foreground/30"
                strokeWidth={strokeWidth}
              />
            )}

            {/* Slices of Pie */}
            {totalQuestions > 0 &&
              activeSegments.map((item) => {
                const percent = item.value / chartTotal;
                const strokeLength = percent * circumference;
                const strokeOffset = circumference - (accumulatedPercent * circumference);
                accumulatedPercent += percent;

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
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                    strokeDashoffset={strokeOffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setActiveIndex(originalIndex)}
                    onMouseLeave={() => setActiveIndex(null)}
                  />
                );
              })
            }
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2 select-none">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider pb-1 border-b border-border/40">
            {activeIndex !== null ? (
              <span>Focused: <span style={{ color: data[activeIndex].color }}>{data[activeIndex].label} ({data[activeIndex].value})</span></span>
            ) : (
              <span>Total: {totalValue} {totalLabel}</span>
            )}
          </div>

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
