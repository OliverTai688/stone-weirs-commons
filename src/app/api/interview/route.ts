import { demoExtract, nextQuestion, LLM_SYSTEM, type InterviewState, type Turn, type DraftEntity } from "@/lib/interview";
import { engineOf, extractJson, resolveAi } from "@/server/ai/llm";
import { describeAiError } from "@/server/qa";
import { requireSession } from "@/server/session";
import type { CrmClass } from "@/lib/types";

interface Body { turns: Turn[]; state: InterviewState; lang: "zh" | "en" }
interface LlmOut {
  entities?: { label: string; crmClass: CrmClass; description?: string; sourceQuote?: string }[];
  relations?: { fromLabel: string; toLabel: string; property: string; label: string }[];
  coverage?: Partial<InterviewState["coverage"]>;
  nextQuestion?: string;
}

export async function POST(req: Request) {
  const { turns, state, lang } = (await req.json()) as Body;
  const last = turns[turns.length - 1];
  if (!last || last.role !== "user" || last.content.length > 4000) return Response.json({ error: "invalid" }, { status: 400 });
  const turnIndex = turns.length - 1;
  const session = await requireSession();
  const ai = await resolveAi(session);
  let aiError: string | undefined;

  if (ai) {
    try {
      const transcript = turns.map((t) => `${t.role === "ai" ? "Interviewer" : "User"}: ${t.content}`).join("\n");
      const known = state.entities.map((e) => `${e.label} (${e.crmClass})`).join(", ") || "none";
      const text = await ai.chat(LLM_SYSTEM, [{ role: "user", content: `Known entities: ${known}\n\nTranscript:\n${transcript}` }], 1500);
      const out = extractJson<LlmOut>(text);
      if (out) {
        const s: InterviewState = structuredClone(state);
        const byLabel = (l: string) => s.entities.find((e) => e.label === l);
        for (const e of out.entities ?? []) {
          if (byLabel(e.label)) continue;
          const d: DraftEntity = { id: `D${s.entities.length + 1}`, crmClass: e.crmClass, label: e.label, description: e.description, sourceTurn: turnIndex, sourceQuote: e.sourceQuote || last.content, confirmed: false };
          s.entities.push(d);
        }
        for (const r of out.relations ?? []) {
          const a = byLabel(r.fromLabel), b = byLabel(r.toLabel);
          if (a && b && a.id !== b.id) s.relations.push({ id: `R${s.relations.length + 1}`, from: a.id, to: b.id, property: r.property, label: r.label, confirmed: false });
        }
        s.coverage = { ...s.coverage, ...(out.coverage ?? {}) };
        return Response.json({ state: s, question: out.nextQuestion || nextQuestion(s, lang), mode: "llm", engine: engineOf(ai) });
      }
      aiError = lang === "zh" ? "AI 回傳的格式無法解析，這一輪改用示範引擎。" : "The AI reply couldn't be parsed, so this turn used the demo engine.";
    } catch (err) {
      aiError = describeAiError(err, lang);
    }
  }
  const s = demoExtract(state, last.content, turnIndex, lang);
  const userTurns = turns.filter((t) => t.role === "user").length;
  return Response.json({ state: s, question: nextQuestion(s, lang, userTurns), mode: "demo", engine: engineOf(null), aiError });
}
