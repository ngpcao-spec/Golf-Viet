import type {
  AiRecommendation,
  AssistantAnswers,
  ScoredCourse,
  SkillLevel,
} from "@/types/assistant";
import type { GolfCourse } from "@/types/golf";

const HEADLINES = [
  "Lựa chọn phù hợp nhất",
  "Lựa chọn thay thế tuyệt vời",
  "Đáng để cân nhắc",
];

const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "người mới chơi",
  intermediate: "trình độ trung bình",
  advanced: "trình độ khá",
  expert: "golfer chuyên nghiệp",
};

const STYLE_LABELS: Record<AssistantAnswers["style"], string> = {
  relaxing: "không gian thư giãn, dễ chơi",
  technical: "thử thách kỹ thuật rõ rệt",
  premium: "dịch vụ cao cấp",
  scenic: "cảnh quan đẹp",
  any: "trải nghiệm cân bằng",
};

const PRIORITY_LABELS: Record<AssistantAnswers["priority"], string> = {
  price: "mức giá tốt trong ngày",
  quality: "chất lượng mặt sân cao",
  distance: "khoảng cách thuận tiện",
  reviews: "đánh giá tốt từ người chơi",
  availability: "nhiều giờ phát bóng buổi sáng",
};

const TAG_HIGHLIGHTS: Record<string, string> = {
  premium: "Trải nghiệm cao cấp",
  technical: "Thử thách kỹ thuật",
  scenic: "Cảnh quan đẹp",
  relaxing: "Dễ chơi, thư giãn",
};

/**
 * Justifications locales en vietnamien, utilisées lorsque OpenAI n'est pas
 * disponible (pas de clé, quota, erreur réseau, réponse invalide).
 * Elle n'invente jamais de donnée : tout vient du moteur déterministe.
 */
export function buildFallbackRecommendations(
  ranked: ScoredCourse[],
  coursesById: Map<string, GolfCourse>,
  answers: AssistantAnswers,
): AiRecommendation[] {
  return ranked.map((item, index) => {
    const course = coursesById.get(item.golfId);
    const highlights: string[] = [];

    if (course) {
      const tagHighlight = course.experienceTags
        .map((tag) => TAG_HIGHLIGHTS[tag])
        .find((label): label is string => Boolean(label));
      if (tagHighlight) highlights.push(tagHighlight);
      highlights.push(`Cách trung tâm ${course.distanceKm} km`);
    }

    if (item.earliestTime) {
      highlights.push(`Giờ sớm nhất ${item.earliestTime}`);
    } else {
      highlights.push("Phù hợp với lịch chơi của bạn");
    }

    const reason = course
      ? `Sân phù hợp với ${SKILL_LABELS[answers.skill]}, mang lại ${
          STYLE_LABELS[answers.style]
        } và đáp ứng ưu tiên ${PRIORITY_LABELS[answers.priority]} của bạn.`
      : "Sân phù hợp với lựa chọn của bạn.";

    return {
      golfId: item.golfId,
      headline: HEADLINES[index] ?? HEADLINES[HEADLINES.length - 1] ?? "Gợi ý cho bạn",
      reason,
      highlights: highlights.slice(0, 3),
    } satisfies AiRecommendation;
  });
}
