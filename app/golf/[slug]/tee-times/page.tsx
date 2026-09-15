import type { Metadata } from "next";
import { courses, coursesBySlug } from "@/data/courses";
import GolfNotFound from "@/components/golf/GolfNotFound";
import TeeTimesClient from "./TeeTimesClient";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const course = coursesBySlug.get(slug);
  return {
    title: course ? `Giờ phát bóng — ${course.name}` : "Không tìm thấy sân golf — Viet Golf",
  };
}

export default async function TeeTimesPage({ params }: Params) {
  const { slug } = await params;
  const course = coursesBySlug.get(slug);
  if (!course) return <GolfNotFound />;
  return <TeeTimesClient course={course} />;
}
