"use client";

import HeroSection from "./_components/HeroSection";
import FeaturedCourseSection from "./_components/FeaturedCourseSection";
import ResultSection from "./_components/ResultSection";
import { useFeaturedCourses } from "./_queries/courses.queries";

export default function Home() {
  const { data: courses = [], isLoading } = useFeaturedCourses();

  return (
    <>
      <HeroSection />
      <FeaturedCourseSection courses={courses} isLoading={isLoading} />
      <ResultSection />
    </>
  );
}
