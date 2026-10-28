/**
 * Tool 1 — AI semi-structured interview → CIDOC-CRM concept graph.
 * Shared types + the deterministic demo extractor (used when no LLM key is set).
 */
import type { CrmClass } from "./types";

export type Facet = "actor" | "place" | "event" | "object" | "term" | "relation" | "governance";

export interface DraftEntity {
  id: string;
  crmClass: CrmClass;
  label: string;
  description?: string;
  sourceTurn: number; // index of the user turn it came from (provenance)
  sourceQuote: string;
  confirmed: boolean; // AI-inferred items start unconfirmed
}
export interface DraftRelation {
  id: string;
  from: string;
  to: string;
  property: string;
  label: string;
  confirmed: boolean;
}
export interface InterviewState {
  entities: DraftEntity[];
  relations: DraftRelation[];
  coverage: Record<Facet, boolean>;
}
export interface Turn {
  role: "ai" | "user";
  content: string;
}

export const emptyState = (): InterviewState => ({
  entities: [],
  relations: [],
  coverage: { actor: false, place: false, event: false, object: false, term: false, relation: false, governance: false },
});

export const facetLabels: Record<Facet, { zh: string; en: string; crm: string }> = {
  actor: { zh: "人物", en: "People", crm: "E39" },
  place: { zh: "地點", en: "Places", crm: "E53" },
  event: { zh: "時間與事件", en: "Events", crm: "E5" },
  object: { zh: "器物與構造", en: "Objects", crm: "E22" },
  term: { zh: "知識與詞彙", en: "Terms", crm: "E73" },
  relation: { zh: "關係與流轉", en: "Relations", crm: "P*" },
  governance: { zh: "治理與同意", en: "Governance", crm: "PROV" },
};

const QUESTIONS: Record<Facet, { zh: string; en: string }> = {
  actor: { zh: "這件事和哪些人有關？他們在社區裡是什麼角色？", en: "Who is involved in this? What role do they play in the community?" },
  place: { zh: "這發生在哪裡？可以公開那個地方的精確位置嗎，還是只標到村或鎮就好？", en: "Where does this happen? May we show the exact location, or only the village or town?" },
  event: { zh: "大概是什麼時候的事？之後又發生了什麼變化？", en: "Roughly when did this happen? What changed afterwards?" },
  object: { zh: "裡面提到的東西或構造是怎麼做成的？用什麼材料？", en: "How is the object or structure made? What materials are used?" },
  term: { zh: "當地人怎麼稱呼它？這個詞在你的語言裡怎麼念、怎麼寫？", en: "What do local people call it? How is the word written and pronounced in your language?" },
  relation: { zh: "這個做法是從哪裡傳來的？後來又傳給了誰？", en: "Where did this practice come from, and who was it passed on to?" },
  governance: { zh: "最後，這段故事可以公開嗎？需要先徵求誰的同意？", en: "Finally, may this story be made public? Whose consent is needed first?" },
};
const ORDER: Facet[] = ["actor", "place", "term", "object", "event", "relation", "governance"];

export const openingQuestion = {
  zh: "你好！請用自己的話說一則和你的海岸、石滬或潮間帶有關的故事。長短都可以，我會一邊聽、一邊幫你畫出概念圖。",
  en: "Hello! Tell me a story about your shore, stone weirs or the intertidal zone, in your own words. I'll draw the concept map as we go.",
};

const PATTERNS: { facet: Facet; crm: CrmClass; re: RegExp }[] = [
  { facet: "actor", crm: "E39", re: /(阿公|阿嬤|阿伯|祖先|老人家|漁民|漁夫|社區|協會|志工|居民|族人|家族|村民|[一-鿿]{1,3}人(?=[，。、把們])|fishers?|elders?|community|association|volunteers?)/gi },
  { facet: "place", crm: "E53", re: /([一-鿿]{1,4}(?:區|鄉|鎮|村|里|港|島|灣|海岸|故事館)|[A-Z][a-z]+ (?:Village|Bay|Island|Harbour|Harbor))/g },
  { facet: "event", crm: "E5", re: /(\d{2,4}\s*年|民國\s*\d+\s*年|日治時期|小時候|以前|後來|漲潮時|退潮時|颱風|(?:in|since) \d{4})/gi },
  { facet: "object", crm: "E22", re: /(石滬|石塭|石牆|石頭|藻礁|漁網|竹簍|魚簍|船|鹹醢飯|料理|stone weir|fish trap|net|boat)/gi },
];
const TERM_RE = /[「“"『]([^」”"』]{1,12})[」”"』]/g;
const GOV_RE = /(可以公開|不能公開|不要公開|同意|授權|不公開|public|consent|private)/i;


export function demoExtract(state: InterviewState, text: string, turnIndex: number, lang: "zh" | "en") {
  const s: InterviewState = structuredClone(state);
  const has = (label: string) => s.entities.find((e) => e.label === label);
  const add = (crmClass: CrmClass, label: string, confirmed = false) => {
    const found = has(label);
    if (found) return found;
    const e: DraftEntity = { id: `D${s.entities.length + 1}`, crmClass, label, sourceTurn: turnIndex, sourceQuote: text, confirmed };
    s.entities.push(e);
    return e;
  };
  const rel = (from: string, to: string, property: string, label: string) => {
    if (from === to || s.relations.some((r) => r.from === from && r.to === to)) return;
    s.relations.push({ id: `R${s.relations.length + 1}`, from, to, property, label, confirmed: false });
  };

  // Every answer is kept as a narrative excerpt: the provenance anchor.
  const excerpt = add("E73", (lang === "zh" ? "敘事 " : "Excerpt ") + (s.entities.filter((e) => e.crmClass === "E73" && e.label.startsWith(lang === "zh" ? "敘事" : "Excerpt")).length + 1), true);
  excerpt.description = text;

  const found: Record<string, DraftEntity[]> = {};
  for (const p of PATTERNS) {
    for (const m of text.matchAll(p.re)) {
      let label = m[1].trim();
      if (p.facet === "event") {
        // Use the clause around the time expression as the event label.
        const idx = m.index ?? 0;
        const start = Math.max(text.lastIndexOf("，", idx), text.lastIndexOf("。", idx), text.lastIndexOf(",", idx), text.lastIndexOf(".", idx)) + 1;
        const ends = ["，", "。", ",", "."].map((c) => text.indexOf(c, idx)).filter((x) => x >= 0);
        const end = ends.length ? Math.min(...ends) : text.length;
        label = text.slice(start, end).trim().slice(0, 18);
      }
      if (label.length < 2) continue;
      const e = add(p.crm, label);
      (found[p.facet] ??= []).push(e);
      s.coverage[p.facet] = true;
      rel(excerpt.id, e.id, "P67", lang === "zh" ? "指涉" : "refers to");
    }
  }
  for (const m of text.matchAll(TERM_RE)) {
    const e = add("E73", `「${m[1]}」`);
    (found.term ??= []).push(e);
    s.coverage.term = true;
    rel(excerpt.id, e.id, "P67", lang === "zh" ? "指涉" : "refers to");
    const obj = (found.object ?? [])[0];
    if (obj) rel(e.id, obj.id, "P1", lang === "zh" ? "是…的稱呼" : "names");
  }
  // Light inference between facets found in the same sentence (unconfirmed).
  for (const o of found.object ?? []) for (const pl of found.place ?? []) rel(o.id, pl.id, "P53", lang === "zh" ? "位於" : "located at");
  for (const ev of found.event ?? []) for (const a of found.actor ?? []) rel(ev.id, a.id, "P11", lang === "zh" ? "參與者" : "had participant");
  for (const o of found.object ?? []) for (const a of found.actor ?? []) rel(o.id, a.id, "P49", lang === "zh" ? "由…維繫" : "kept by");
  if (s.relations.some((r) => r.property !== "P67")) s.coverage.relation = true;
  if (GOV_RE.test(text)) s.coverage.governance = true;
  return s;
}

const DEEPEN = [
  { zh: "這些知識後來是誰在守護？守護的方式有沒有改變？", en: "Who looks after this knowledge now? Has the way it is cared for changed?" },
  { zh: "還有哪些和海有關的飲食或生活習慣，是這個社群特有的？", en: "Are there foods or daily practices tied to the sea that are special to this community?" },
];

export function nextQuestion(state: InterviewState, lang: "zh" | "en", userTurns = 99) {
  const missing = ORDER.find((f) => !state.coverage[f]);
  // Keep governance as the closing question: deepen the story first while it is still short.
  if (missing === "governance" && userTurns <= DEEPEN.length + 1) return DEEPEN[Math.max(0, userTurns - 2) % DEEPEN.length][lang];
  if (!missing)
    return lang === "zh"
      ? "謝謝你！七個面向都有基本資訊了。請在右邊的概念圖確認 AI 推測的節點（虛線），確認後就可以送給節點管理者審查。"
      : "Thank you! All seven facets have basic information. Please confirm the AI-inferred items (dashed) on the map, then submit for review.";
  return QUESTIONS[missing][lang];
}

export const LLM_SYSTEM = `You are a gentle oral-history interviewer helping a community member turn their story into a CIDOC-CRM concept graph.
Use ONLY what the user said. Never invent facts. Keep local-language terms verbatim.
CIDOC-CRM classes allowed: E39 Actor, E53 Place, E5 Event, E22 Human-Made Object, E18 Physical Thing, E73 Information Object.
Facets to cover: actor, place, event, object, term, relation, governance.
Reply with ONLY a JSON object:
{"entities":[{"label":"...","crmClass":"E39","description":"...","sourceQuote":"exact words from the user"}],
 "relations":[{"fromLabel":"...","toLabel":"...","property":"P53","label":"located at"}],
 "coverage":{"actor":true,...},
 "nextQuestion":"one or two short follow-up questions in the user's language, targeting the biggest gap; ask about public/consent and location sensitivity when relevant"}
Entities and relations are only the NEW ones from the latest answer.`;

/** Demo interview script built only from facts in the APCONF paper. */
export const demoScript = [
  "我是新屋的客家漁民，從小跟阿公在海邊。我們把石滬叫做「石塭」，漲潮的時候叫「流水來」。",
  "新屋區海岸有石塭，也有藻礁。藻礁長得很慢，大概每 10 年才長 1 公分。",
  "以前是志工在巡守石滬，後來成立了協會來管理。",
  "我們也會做鹹醢飯，用鹽、蒜和米酒做成。",
  "這段故事可以公開，但石滬的精確位置不要公開。",
];
