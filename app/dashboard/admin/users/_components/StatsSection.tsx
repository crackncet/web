import { Users as UsersIcon, CheckCircle, Ban } from "lucide-react";

export default function StatsSection({totalCount, activePercent}: {totalCount: number, activePercent: string}) {
  return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat 1: Total */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-xs">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Users
            </p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {totalCount}
            </p>
          </div>
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
            <UsersIcon className="h-4 w-4" />
          </div>
        </div>

        
      </div>
  )
}