"use client";

import React from "react";
import { useParams } from "next/navigation";
import SubjectWorkspace from "../../../_components/subject-workspace";

export default function MemberSubjectDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const courseSubjectId = params.courseSubjectId as string;

  return (
    <SubjectWorkspace
      courseId={courseId}
      courseSubjectId={courseSubjectId}
      isAdmin={false}
    />
  );
}
