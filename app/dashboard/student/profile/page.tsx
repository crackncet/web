"use client";

import { StudentHeader } from "../layout";
import { ProfileView } from "@/components/profile/ProfileView";

export default function StudentProfilePage() {
  return (
    <div className="space-y-6">
      <StudentHeader>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider select-none">
            <span>SETTINGS</span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-primary/90">Profile</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground select-none mt-0.5">
            My Profile
          </h1>
        </div>
      </StudentHeader>

      <ProfileView />
    </div>
  );
}
