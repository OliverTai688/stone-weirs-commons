import { answer } from "@/lib/qa";

export async function POST(req: Request) {
  const { question, nodeSlugs, lang } = (await req.json()) as { question?: string; nodeSlugs?: string[]; lang?: "zh-Hant" | "en" };
  if (!question || question.length > 500) return Response.json({ error: "invalid question" }, { status: 400 });
  // TODO(supabase): enforce visitor quota (3/day) and write qa_logs.
  return Response.json(await answer(question, { nodeSlugs, lang }));
}
