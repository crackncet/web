"use client";

import HeroSection from "./_components/HeroSection";
import FeaturedCourseSection from "./_components/FeaturedCourseSection";
import FeaturedTestSeriesSection from "./_components/FeaturedTestSeriesSection";
import ResultSection from "./_components/ResultSection";
import MentorsSection from "./_components/MentorsSection";
import { useFeaturedCourses } from "./_queries/courses.queries";
import { useFeaturedTestSeries } from "./_queries/test-series.queries";
import ContactUsSection from "./_components/ContactUsSection";

export default function Home() {
  const { data: courses = [], isLoading } = useFeaturedCourses();
  const { data: testSeries = [], isLoading: isTestSeriesLoading } = useFeaturedTestSeries();

  return (
    <>
      <HeroSection />
      <FeaturedCourseSection courses={courses} isLoading={isLoading} />
      <FeaturedTestSeriesSection testSeries={testSeries} isLoading={isTestSeriesLoading} />
      <ResultSection />
      <MentorsSection />
      <ContactUsSection />
    </>
  );
}
