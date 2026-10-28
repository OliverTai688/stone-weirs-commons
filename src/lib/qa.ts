import { baselineAnswers } from "@/data/xinwu";
import { listIndexableEntities, listEntities } from "./repo";
import { callClaude, llmEnabled } from "./llm";
import type { Entity } from "./types";

export interface Citation {
  id: string;
  nodeSlug: string;
  label: string;
}
export interface QaResult {
  answer: string;
  citations: Citation[];
  grounded: boolean;
  mode: "llm" | "demo";
  baseline?: { answer: string; error: string };
  guard?: string;
}

const norm = (s: string) => s.toLowerCase();

function bigrams(s: string) {
  // CJK only: Latin letter pairs match almost everything and add noise.
  const t = norm(s).replace(/[^\u4e00-\u9fff]/g, "");
  const out = new Set<string>();
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
  return out;
}

/** How many entities share a keyword: common words (e.g. 石滬) weigh less. */
function docFreq(pool: Entity[]) {
  const df = new Map<string, number>();
  for (const e of pool) for (const k of new Set(e.keywords.map(norm))) df.set(k, (df.get(k) ?? 0) + 1);
  return df;
}

/** The node's own topic appears in almost every question, so it carries little signal. */
const TOPIC_TERMS = new Set(["石滬", "stone weir"]);

function score(q: string, e: Entity, df: Map<string, number>) {
  const nq = norm(q);
  let s = 0;
  for (const k of e.keywords) {
    const nk = norm(k);
    if (!nq.includes(nk)) continue;
    s += TOPIC_TERMS.has(nk) ? 1 : 3 + Math.min(nk.length, 4) / (df.get(nk) ?? 1);
  }
  // Intent: "what is it called" questions favour records that carry local-language terms.
  if (e.terms?.length && /(怎麼說|怎麼稱呼|叫什麼|叫做|說法|詞彙|how do you say|what.*call|\bcall|term|word)/i.test(q)) s += 3;
  const qb = bigrams(q);
  const lb = bigrams(`${e.label["zh-Hant"] ?? ""}${e.label.en ?? ""}`);
  for (const b of qb) if (lb.has(b)) s += 1;
  return s;
}

export async function retrieve(question: string, nodeSlugs?: string[], k = 4) {
  const pool = await listIndexableEntities(nodeSlugs);
  const df = docFreq(pool);
  const ranked = pool
    .map((e) => ({ e, s: score(question, e, df) }))
    .filter((x) => x.s >= 3)
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map((x) => x.e);
  if (ranked.length) return ranked;
  // "What is a stone weir?" — fall back to the topic object itself.
  const nq = norm(question);
  return [...TOPIC_TERMS].some((t) => nq.includes(t)) ? pool.filter((e) => e.crmClass === "E22" && [...TOPIC_TERMS].some((t) => norm(e.label["zh-Hant"] ?? "").includes(t))).slice(0, 1) : [];
}

const LOCATION_RE = /(精確|座標|經緯度|gps|exact location|coordinates|在哪裡.*石滬|石滬.*在哪)/i;

export async function answer(question: string, opts: { nodeSlugs?: string[]; lang?: "zh-Hant" | "en" } = {}): Promise<QaResult> {
  const lang = opts.lang ?? (/[一-鿿]/.test(question) ? "zh-Hant" : "en");
  const baselineHit = baselineAnswers.find((b) => b.match.some((m) => norm(question).includes(norm(m))));
  const baseline = baselineHit ? { answer: baselineHit.answer, error: baselineHit.error } : undefined;

  // Geo-privacy guard: never reveal restricted coordinates.
  let guard: string | undefined;
  if (LOCATION_RE.test(question)) {
    const restricted = (await listEntities("xinwu")).filter((e) => e.governance.geoTier === "restricted");
    if (restricted.length)
      guard =
        lang === "zh-Hant"
          ? "石滬遺構的精確座標屬於限制級地理隱私，不會公開。可公開的範圍是行政區層級：桃園市新屋區［新屋・X-PL-XINWU］。"
          : "Precise stone weir coordinates are geo-restricted and never disclosed. The public extent is district level: Xinwu District, Taoyuan [Xinwu · X-PL-XINWU].";
  }

  let hits = await retrieve(question, opts.nodeSlugs);
  if (guard) hits = [];
  // Answer-type check for the demo engine: a record that merely mentions the topic
  // is not an answer. Count / quantity questions need a number; date questions need a year.
  if (!llmEnabled()) {
    const text = (e: Entity) => `${e.description["zh-Hant"]}${e.description.en}`;
    if (/(幾座|幾個|多少|how many)/i.test(question)) hits = hits.filter((e) => /\d+\s*(座|個|處)/.test(text(e)));
    if (/(哪一年|何時|什麼時候|when|what year)/i.test(question)) hits = hits.filter((e) => /\d{3,4}\s*年|\b\d{4}\b/.test(text(e)));
  }
  const citations: Citation[] = hits.map((e) => ({ id: e.id, nodeSlug: e.nodeSlug, label: e.label[lang] ?? e.label["zh-Hant"] ?? e.id }));

  if (!hits.length) {
    return {
      answer:
        guard ??
        (lang === "zh-Hant"
          ? "目前資料庫中沒有足夠的資訊回答這個問題。歡迎到討論區提問，或在你的在地節點新增一則故事。"
          : "There is not enough governed information to answer this yet. Ask in the community, or add a story to your local node."),
      citations: guard ? [{ id: "X-PL-XINWU", nodeSlug: "xinwu", label: "桃園市新屋區" }] : [],
      grounded: Boolean(guard),
      mode: "demo",
      baseline,
      guard,
    };
  }

  if (llmEnabled()) {
    try {
      const context = hits
        .map((e) => `[${e.id}] (${e.crmClass}) ${e.label["zh-Hant"]} / ${e.label.en}\n${e.description["zh-Hant"]}\n${e.description.en}`)
        .join("\n\n");
      const system = `You answer questions about maritime cultural heritage using ONLY the governed records provided.
Rules:
- Every factual sentence must end with a citation like [PL-03] using record IDs from the context.
- Never add facts, numbers or ingredients that are not in the records. If the records do not answer the question, say so plainly.
- Keep local-language terms (e.g. Hakka 石塭) verbatim.
- Never reveal precise coordinates.
- Answer in ${lang === "zh-Hant" ? "Traditional Chinese" : "English"}, in 1-4 sentences.`;
      const text = await callClaude(system, [{ role: "user", content: `Records:\n${context}\n\nQuestion: ${question}` }], 500);
      const cited = [...text.matchAll(/\[([A-Z0-9-]+)\]/g)].map((m) => m[1]);
      const allowed = new Set(hits.map((h) => h.id));
      const valid = cited.length > 0 && cited.every((c) => allowed.has(c));
      if (valid) {
        return { answer: guard ? `${guard}\n\n${text}` : text, citations: citations.filter((c) => cited.includes(c.id)), grounded: true, mode: "llm", baseline, guard };
      }
      // fall through to deterministic answer if citations fail validation
    } catch (err) {
      console.error(err);
    }
  }

  const body = hits
    .slice(0, 2)
    .map((e) => `${e.description[lang] ?? e.description["zh-Hant"]}［新屋・${e.id}］`)
    .join("\n\n");
  return { answer: guard ? `${guard}\n\n${body}` : body, citations: citations.slice(0, 2), grounded: true, mode: "demo", baseline, guard };
}
