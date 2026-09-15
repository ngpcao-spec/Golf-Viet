import type { Metadata } from "next";
import { courses, coursesBySlug } from "@/data/courses";
import GolfNotFound from "@/components/golf/GolfNotFound";
import GolfDetailClient from "./GolfDetailClient";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = coursesBySlug.get(slug);
  if (!course) return { title: "Không tìm thấy sân golf — Viet Golf" };
  return {
    title: `${course.name} — Viet Golf`,
    description: course.descriptionVi.slice(0, 150),
  };
}

export default async function GolfPage({ params }: Params) {
  const { slug } = await params;
  const course = coursesBySlug.get(slug);
  if (!course) return <GolfNotFound />;
  return <GolfDetailClient course={course} />;
}
