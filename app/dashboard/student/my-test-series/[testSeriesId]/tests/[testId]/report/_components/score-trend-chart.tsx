"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface AttemptItem {
  id: string;
  attemptNumber: number;
  totalScore: string | number;
  completedAt?: string | null;
  submittedAt?: string | null;
}

interface ScoreTrendChartProps {
  allAttempts: AttemptItem[];
  activeAttemptNumber?: number;
  maxPossibleScore: number;
  onSelectAttempt?: (id: string, attemptNumber: number) => void;
  className?: string;
}

export function ScoreTrendChart({
  allAttempts,
  activeAttemptNumber,
  maxPossibleScore,
  onSelectAttempt,
  className,
}: ScoreTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!allAttempts || allAttempts.length === 0) return null;

  // Chart dimensions - reduced height proportionally
  const svgWidth = 600;
  const svgHeight = 90; // Reduced height from 130 to 90
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 10;
  const paddingBottom = 20;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Parse scores
  const scores = allAttempts.map((a) => parseFloat(a.totalScore as string));

  // Compute boundaries for Y-axis scaling
  const minScoreDb = Math.min(...scores);
  const maxScoreDb = Math.max(...scores);
  
  // Set chart range boundaries (make sure we show below zero or above zero logically)
  const minScore = Math.min(0, minScoreDb) - 1; 
  const maxScore = Math.max(maxPossibleScore, maxScoreDb) + 1;
  const scoreRange = maxScore - minScore;

  // Coordinate calculation helpers
  const getX = (index: number) => {
    if (allAttempts.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + index * (chartWidth / (allAttempts.length - 1));
  };

  const getY = (score: number) => {
    return paddingTop + chartHeight - ((score - minScore) / scoreRange) * chartHeight;
  };

  // Build the path line and area points
  let pathD = "";
  let areaD = "";
  const points: { x: number; y: number; score: number; attempt: AttemptItem; index: number }[] = [];

  allAttempts.forEach((attempt, index) => {
    const scoreVal = parseFloat(attempt.totalScore as string);
    const x = getX(index);
    const y = getY(scoreVal);
    points.push({ x, y, score: scoreVal, attempt, index });

    if (index === 0) {
      pathD = `M ${x} ${y}`;
      areaD = `M ${x} ${paddingTop + chartHeight} L ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
      areaD += ` L ${x} ${y}`;
    }
  });

  if (allAttempts.length > 0) {
    const lastX = getX(allAttempts.length - 1);
    areaD += ` L ${lastX} ${paddingTop + chartHeight} Z`;
  }

  // Y-axis gridlines count (e.g. 3 steps for shorter height)
  const gridlineCount = 3;
  const gridlines = Array.from({ length: gridlineCount + 1 }).map((_, i) => {
    const scoreVal = minScore + (i / gridlineCount) * scoreRange;
    return {
      score: scoreVal,
      y: getY(scoreVal),
    };
  });

  return (
    <div className={cn("bg-card p-5 rounded-2xl border border-border/60 shadow-sm space-y-3", className)}>
      <div className="flex justify-between items-center select-none">
        <div className="space-y-0.5">
          <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span>Score Analytics History</span>
          </h4>
          <p className="text-[8px] md:text-[9px] text-muted-foreground font-semibold">
            Performance progression over attempts
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[9px] font-bold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary/80" />
            <span>Mock Score</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto select-none pt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[420px] h-auto overflow-visible"
        >
          <defs>
            {/* Area gradient */}
            <linearGradient id="cbtChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.00" />
            </linearGradient>
            {/* Glow effect on hover */}
            <filter id="cbtGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {gridlines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={svgWidth - paddingRight}
                y2={line.y}
                className="stroke-border/30"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 2.5}
                className="fill-muted-foreground text-[7.5px] font-bold text-right"
                textAnchor="end"
              >
                {line.score.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Render Area Path */}
          {allAttempts.length > 1 && (
            <path
              d={areaD}
              fill="url(#cbtChartGradient)"
            />
          )}

          {/* Render Line Path */}
          {allAttempts.length > 1 && (
            <path
              d={pathD}
              fill="none"
              className="stroke-primary"
              strokeWidth={2}
            />
          )}

          {/* Plot Markers */}
          {points.map((pt, idx) => {
            const isActive = pt.attempt.attemptNumber === activeAttemptNumber;
            const isHovered = hoverIndex === idx;

            return (
              <g key={idx} className="cursor-pointer">
                {/* Large transparent interactive target */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={10}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onClick={() => onSelectAttempt?.(pt.attempt.id, pt.attempt.attemptNumber)}
                />

                {/* Simple smaller dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 3.5 : isHovered ? 3.0 : 2.0}
                  className="transition-all duration-200 fill-primary stroke-none"
                  style={{ filter: isHovered || isActive ? "url(#cbtGlow)" : undefined }}
                  pointerEvents="none"
                />

                {/* X-axis labels */}
                <text
                  x={pt.x}
                  y={svgHeight - paddingBottom + 13}
                  className={cn(
                    "fill-muted-foreground text-[7.5px] font-bold transition-all",
                    isActive && "fill-primary font-black"
                  )}
                  textAnchor="middle"
                  onClick={() => onSelectAttempt?.(pt.attempt.id, pt.attempt.attemptNumber)}
                >
                  {`Att ${pt.attempt.attemptNumber}`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute z-10 bg-popover text-popover-foreground border border-border px-2 py-1 rounded-lg shadow-md text-[8px] pointer-events-none select-none font-bold flex flex-col gap-0.5"
            style={{
              left: `${(points[hoverIndex].x / svgWidth) * 100}%`,
              top: `${(points[hoverIndex].y / svgHeight) * 100 - 20}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="text-muted-foreground uppercase text-[6.5px] tracking-wide">
              Attempt #{points[hoverIndex].attempt.attemptNumber}
            </div>
            <div className="flex items-center gap-1">
              <span>Score:</span>
              <span className="text-primary font-black">{points[hoverIndex].score}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
