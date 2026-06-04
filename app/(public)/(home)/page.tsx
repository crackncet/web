"use client";

import HeroSection from "./_components/HeroSection";
import FeaturedCourseSection from "./_components/FeaturedCourseSection";
import ResultSection from "./_components/ResultSection";
import MentorsSection from "./_components/MentorsSection";
import { useFeaturedCourses } from "./_queries/courses.queries";
import ContactUsSection from "./_components/ContactUsSection";

export default function Home() {
  const { data: courses = [], isLoading } = useFeaturedCourses();

  return (
    <>
      <HeroSection />
      <FeaturedCourseSection courses={courses} isLoading={isLoading} />
      <ResultSection />
      <MentorsSection />
      <ContactUsSection />
    </>
  );
}
