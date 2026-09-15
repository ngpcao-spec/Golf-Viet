import "server-only";

import OpenAI from "openai";
import { aiPayloadSchema } from "@/lib/ai/schemas";
import type { AiRecommendation, AssistantAnswers, ScoredCourse } from "@/types/assistant";
import type { GolfCourse } from "@/types/golf";

const SYSTEM_PROMPT = `Tu es l'assistant de recommandation de Viet Golf.
Tu dois uniquement expliquer pourquoi les parcours fournis correspondent au profil du joueur.
Tu ne dois jamais modifier les informations fournies.
Tu ne dois jamais inventer de prix, d'heure, de distance, de note ou de caractéristique.
Réponds uniquement en vietnamien.
Chaque justification doit être concise, naturelle et premium.
Maximum environ 35 mots.
Maximum 3 highlights.
Les golfId renvoyés doivent obligatoirement appartenir à la liste reçue.
Ne recommande jamais un golf absent de la liste.
Réponds uniquement avec un objet JSON de la forme
{"recommendations":[{"golfId":"...","headline":"...","reason":"...","highlights":["...","..."]}]}.`;

const TIMEOUT_MS = 12_000;

export function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function buildUserPayload(
  ranked: ScoredCourse[],
  coursesById: Map<string, GolfCourse>,
  answers: AssistantAnswers,
) {
  return {
    profilJoueur: answers,
    parcours: ranked.map((item) => {
      const course = coursesById.get(item.golfId);
      return {
        golfId: item.golfId,
        ten: course?.name ?? item.golfId,
        khuVuc: course?.area ?? "",
        doKho: course?.difficulty ?? "",
        phongCach: course?.experienceTags ?? [],
        diemSan: course?.courseScore ?? 0,
        danhGia: course?.rating ?? 0,
        khoangCachKm: course?.distanceKm ?? 0,
        giaThapNhat: item.cheapestPrice,
        gioSomNhat: item.earliestTime,
        soGioTrong: item.availableCount,
        mucDoPhuHop: item.matchPercent,
      };
    }),
  };
}

/**
 * Appel OpenAI purement cosmétique : titre, justification et highlights.
 * Retourne `null` dès qu'un problème survient, l'appelant bascule alors
 * sur le fallback local.
 */
export async function generateAiRecommendations(
  ranked: ScoredCourse[],
  coursesById: Map<string, GolfCourse>,
  answers: AssistantAnswers,
): Promise<AiRecommendation[] | null> {
  if (!hasOpenAiKey() || ranked.length === 0) return null;

  const allowedIds = new Set(ranked.map((r) => r.golfId));

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: TIMEOUT_MS,
      maxRetries: 1,
    });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
      instructions: SYSTEM_PROMPT,
      input: JSON.stringify(buildUserPayload(ranked, coursesById, answers)),
      text: { format: { type: "json_object" } },
    });

    const raw = response.output_text;
    if (!raw) return null;

    const parsed = aiPayloadSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    const filtered = parsed.data.recommendations.filter((r) => allowedIds.has(r.golfId));
    return filtered.length > 0 ? filtered : null;
  } catch {
    // Pas de clé, quota, timeout, réseau, JSON invalide : on reste silencieux
    // côté client et le fallback local prend le relais.
    return null;
  }
}
