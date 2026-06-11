import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex gap-2.5 items-center w-full max-w-2xl select-none">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
        <Input
          placeholder="Search..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-4 h-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus-visible:ring-1 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-xs font-semibold w-full"
        />
      </div>
      <button 
        className="h-10 px-6 bg-slate-950 dark:bg-slate-50 text-white dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-150 text-xs font-bold transition-all border border-slate-950 dark:border-slate-50 cursor-pointer flex items-center justify-center shadow-sm"
      >
        Search
      </button>
    </div>
  );
}
