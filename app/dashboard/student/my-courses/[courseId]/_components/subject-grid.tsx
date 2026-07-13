"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  ChevronRight,
  Atom,
  FlaskConical,
  Calculator,
  Dna,
  Languages,
  Brain,
} from "lucide-react";
import { SubjectSyllabus } from "../_api/course-detail.api";

interface SubjectGridProps {
  courseId: string;
  subjects: SubjectSyllabus[];
}

export function SubjectGrid({ courseId, subjects }: SubjectGridProps) {
  const tabs = [
    { id: "DOMAIN", label: "Domain" },
    { id: "NON_DOMAIN", label: "Non-Domain" },
    { id: "LANGUAGE", label: "Language" },
  ];

  const colors = [
    { bg: "from-blue-500/10 to-indigo-500/5 border-blue-500/20 text-blue-600 dark:text-blue-400", iconBg: "bg-white text-blue-600 shadow-xs" },
    { bg: "from-teal-500/10 to-emerald-500/5 border-teal-500/20 text-teal-600 dark:text-teal-400", iconBg: "bg-white text-teal-600 shadow-xs" },
    { bg: "from-purple-500/10 to-indigo-500/5 border-purple-500/20 text-purple-600 dark:text-purple-400", iconBg: "bg-white text-purple-600 shadow-xs" },
    { bg: "from-emerald-500/10 to-green-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400", iconBg: "bg-white text-emerald-600 shadow-xs" },
    { bg: "from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400", iconBg: "bg-white text-amber-600 shadow-xs" },
    { bg: "from-rose-500/10 to-pink-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400", iconBg: "bg-white text-rose-600 shadow-xs" },
    { bg: "from-cyan-500/10 to-blue-500/5 border-cyan-500/20 text-cyan-600 dark:text-cyan-400", iconBg: "bg-white text-cyan-600 shadow-xs" },
    { bg: "from-orange-500/10 to-rose-500/5 border-orange-500/20 text-orange-600 dark:text-orange-400", iconBg: "bg-white text-orange-600 shadow-xs" }
  ];

  const getSubjectIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("physics")) return Atom;
    if (n.includes("chemistry")) return FlaskConical;
    if (n.includes("math") || n.includes("calc")) return Calculator;
    if (n.includes("bio")) return Dna;
    if (n.includes("english")) return BookOpen;
    if (n.includes("hindi") || n.includes("language") || n.includes("odia")) return Languages;
    if (n.includes("teaching")) return GraduationCap;
    if (n.includes("aptitude") || n.includes("mental") || n.includes("general")) return Brain;
    return BookOpen;
  };

  const initialTab = tabs.find(t => subjects.some(s => s.subjectType === t.id))?.id || "DOMAIN";
  const [activeTab, setActiveTab] = useState(initialTab);

  const filteredSubjects = subjects.filter((s) => s.subjectType === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
        <GraduationCap className="h-4 w-4 text-primary" />
        <span>Subjects in Course</span>
      </div>

      <div className="flex flex-col rounded-3xl border border-border/80 overflow-hidden shadow-sm bg-card">
        {/* Tab Header Selector */}
        <div className="grid grid-cols-3 border-b border-border bg-muted/10 divide-x divide-border">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-center text-xs md:text-sm font-bold transition-all relative cursor-pointer select-none ${
                  isActive
                    ? "bg-card text-primary font-extrabold"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                }`}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panel / Grid Content */}
        <div className="p-6 min-h-[260px] flex flex-col justify-center bg-card">
          {filteredSubjects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 select-none">
              <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-foreground text-sm">No subjects found</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  There are no {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} subjects in this course syllabus.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredSubjects.map((subject, sIdx) => {
                const progress = subject.progressPercentage ?? 0;
                const color = colors[sIdx % colors.length];
                const Icon = getSubjectIcon(subject.subjectName);

                return (
                  <Link
                    key={subject.courseSubjectId}
                    href={`/dashboard/student/my-courses/${courseId}/subjects/${subject.courseSubjectId}`}
                    className={`group flex flex-col justify-between p-6 bg-gradient-to-br ${color.bg} border rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 min-h-[220px]`}
                  >
                    {/* Top Content */}
                    <div className="space-y-4">
                      <div className={`h-12 w-12 rounded-2xl ${color.iconBg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-foreground group-hover:text-primary transition-colors text-base text-left leading-tight">
                          {subject.subjectName}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider text-left">
                          {subject.subjectType.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Content & Progress */}
                    <div className="space-y-3 mt-6">
                      <div className="w-full space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground">
                          <span>PROGRESS</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-muted/60 dark:bg-muted/30 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {subject.chapters.length} {subject.chapters.length === 1 ? "Chapter" : "Chapters"}
                        </span>
                        <span className="h-8 w-8 rounded-full bg-white dark:bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs">
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
