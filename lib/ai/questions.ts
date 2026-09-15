import type { AssistantAnswers } from "@/types/assistant";

export type QuestionKey = keyof AssistantAnswers;

export type Question = {
  key: QuestionKey;
  title: string;
  options: Array<{ value: string; label: string }>;
};

export const QUESTIONS: Question[] = [
  {
    key: "skill",
    title: "Trình độ chơi golf của bạn?",
    options: [
      { value: "beginner", label: "Mới chơi" },
      { value: "intermediate", label: "Trung bình" },
      { value: "advanced", label: "Khá" },
      { value: "expert", label: "Chuyên nghiệp" },
    ],
  },
  {
    key: "style",
    title: "Bạn muốn trải nghiệm sân như thế nào?",
    options: [
      { value: "relaxing", label: "Thư giãn & dễ chơi" },
      { value: "technical", label: "Kỹ thuật & thử thách" },
      { value: "premium", label: "Cao cấp" },
      { value: "scenic", label: "Cảnh quan đẹp" },
      { value: "any", label: "Không quan trọng" },
    ],
  },
  {
    key: "budget",
    title: "Ngân sách mỗi người?",
    options: [
      { value: "under_1500", label: "Dưới 1,5 triệu" },
      { value: "1500_2500", label: "1,5 – 2,5 triệu" },
      { value: "2500_4000", label: "2,5 – 4 triệu" },
      { value: "any", label: "Không quan trọng" },
    ],
  },
  {
    key: "distance",
    title: "Bạn muốn đi xa tối đa bao nhiêu?",
    options: [
      { value: "15", label: "Dưới 15 km" },
      { value: "30", label: "Dưới 30 km" },
      { value: "50", label: "Dưới 50 km" },
      { value: "any", label: "Không quan trọng" },
    ],
  },
  {
    key: "priority",
    title: "Điều gì quan trọng nhất với bạn?",
    options: [
      { value: "price", label: "Giá tốt nhất" },
      { value: "quality", label: "Chất lượng sân" },
      { value: "distance", label: "Gần nhất" },
      { value: "reviews", label: "Đánh giá tốt" },
      { value: "availability", label: "Có giờ chơi sớm" },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
