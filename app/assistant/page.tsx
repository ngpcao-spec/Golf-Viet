"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import AssistantProgress from "@/components/ai/AssistantProgress";
import ChoiceCard from "@/components/ai/ChoiceCard";
import { QUESTIONS, TOTAL_QUESTIONS } from "@/lib/ai/questions";
import { useDemoStore } from "@/store/demoStore";
import type { PartialAssistantAnswers } from "@/types/assistant";

const TRANSITION_MS = 220;

export default function AssistantPage() {
  const router = useRouter();
  const setAssistantAnswers = useDemoStore((s) => s.setAssistantAnswers);
  const resetAssistantAnswers = useDemoStore((s) => s.resetAssistantAnswers);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PartialAssistantAnswers>({});
  const [searching, setSearching] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    resetAssistantAnswers();
    const stored = timers.current;
    return () => stored.forEach(clearTimeout);
  }, [resetAssistantAnswers]);

  const question = QUESTIONS[step];
  if (!question) return null;

  const select = (value: string) => {
    if (searching) return;
    const next = { ...answers, [question.key]: value } as PartialAssistantAnswers;
    setAnswers(next);
    setAssistantAnswers({ [question.key]: value } as PartialAssistantAnswers);

    if (step < TOTAL_QUESTIONS - 1) {
      timers.current.push(setTimeout(() => setStep((s) => s + 1), TRANSITION_MS));
    } else {
      setSearching(true);
      timers.current.push(setTimeout(() => router.push("/assistant/results"), 1100));
    }
  };

  const goBack = () => {
    if (searching) return;
    if (step === 0) router.push("/");
    else setStep((s) => s - 1);
  };

  if (searching) {
    return (
      <main className="safe-top flex min-h-[80dvh] flex-col items-center justify-center px-8 text-center">
        <span className="flex size-16 animate-pulse items-center justify-center rounded-full border border-[rgba(216,180,90,0.4)] bg-[rgba(216,180,90,0.08)]">
          <Sparkles className="size-7 text-gold" aria-hidden="true" />
        </span>
        <p
          className="mt-5 font-[family-name:var(--font-display)] text-[21px] font-semibold"
          role="status"
        >
          Đang tìm sân phù hợp nhất cho bạn...
        </p>
        <p className="mt-2 text-[13px] text-text-secondary">
          Chúng tôi đang so sánh các sân golf theo lựa chọn của bạn.
        </p>
      </main>
    );
  }

  return (
    <main className="safe-top px-4 pb-8">
      <div className="flex items-center gap-3 pb-4">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={goBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-gold bg-card"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <p className="flex items-center gap-2 text-[15px] font-semibold">
          <Sparkles className="size-4 text-gold" aria-hidden="true" />
          Trợ lý Viet Golf
        </p>
      </div>

      <AssistantProgress step={step + 1} total={TOTAL_QUESTIONS} />

      <h1
        key={question.key}
        className="animate-fade-up mt-6 font-[family-name:var(--font-display)] text-[25px] leading-tight font-semibold"
      >
        {question.title}
      </h1>

      <ul key={`${question.key}-options`} className="animate-fade-up mt-5 space-y-2.5">
        {question.options.map((option) => (
          <li key={option.value}>
            <ChoiceCard
              label={option.label}
              selected={answers[question.key] === option.value}
              onSelect={() => select(option.value)}
            />
          </li>
        ))}
      </ul>

      <p className="mt-6 text-center text-[11px] text-text-secondary/70">
        Chỉ cần chọn — không cần nhập chữ.
      </p>
    </main>
  );
}
