"use client";
import FeaturedCourseSection from "../(home)/_components/FeaturedCourseSection";
import { useFeaturedCourses } from "../(home)/_queries/courses.queries";

export default function CoursesPage() {
  const { data: courses = [], isLoading } = useFeaturedCourses();
  return (
    <>
      <FeaturedCourseSection courses={courses} isLoading={isLoading} />
    </>
  );
}