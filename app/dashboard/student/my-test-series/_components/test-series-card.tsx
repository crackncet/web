"use client";

import Link from "next/link";
import Image from "next/image";
import { ClipboardList, Calendar } from "lucide-react";
import { EnrolledTestSeries } from "../_api/my-test-series.api";

interface TestSeriesCardProps {
  testSeries: EnrolledTestSeries;
}

export function TestSeriesCard({ testSeries }: TestSeriesCardProps) {
  const enrolledDate = new Date(testSeries.enrolledAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/dashboard/student/my-test-series/${testSeries.testSeriesId}`}
      className="block group rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 min-h-[44px]"
    >
      <div className="flex flex-col gap-3">
        {/* Banner with 16:9 aspect ratio */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
          {testSeries.banner ? (
            <Image
              src={testSeries.banner}
              alt={testSeries.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
              <ClipboardList className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1.5">
          {/* Exam Name Badge */}
          <div className="flex">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {testSeries.examName}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {testSeries.name}
          </h3>

          {/* Description */}
          {testSeries.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {testSeries.description}
            </p>
          )}

          {/* Enrolled date */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Enrolled on {enrolledDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
