import { answer } from "@/server/qa";
import { resolveAi } from "@/server/ai/llm";
import { requireSession } from "@/server/session";

/** BFF: governed Q&A. The browser never sees which key is used, only the engine label. */
export async function POST(req: Request) {
  const { question, nodeSlugs, lang } = (await req.json()) as { question?: string; nodeSlugs?: string[]; lang?: "zh-Hant" | "en" };
  if (!question || question.length > 500) return Response.json({ error: "invalid question" }, { status: 400 });
  const session = await requireSession();
  const ai = await resolveAi(session);
  // TODO(supabase): enforce the visitor quota (3 custom questions/day) per session — demo questions are exempt — and write qa_logs (user_id = session.userId).
  return Response.json(await answer(question, { nodeSlugs, lang, ai }));
}
