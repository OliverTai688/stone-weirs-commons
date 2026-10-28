import type { Entity, Governance, Relation } from "@/lib/types";

/**
 * Xinwu stone weir node — DEMO SEED.
 *
 * Every fact below is taken from the APCONF paper
 * "Stone Weirs, Shared Futures" (Tai et al., 2026). Nothing is invented:
 * the platform's whole argument is that AI must not fabricate heritage facts.
 *
 * IDs that appear in the paper (PL-03, OB-01, OB-02, OB-04, NE-01, NE-05) keep
 * their paper IDs. Records composed for the demo use an "X-" prefix and should
 * be replaced by the full 35-record governed dataset (see SETUP.md).
 */

const gov = (over: Partial<Governance> = {}): Governance => ({
  fpic: "assumed",
  license: { "zh-Hant": "依來源授權（正式資料匯入時確認）", en: "Per source licence (confirmed on full import)" },
  geoTier: "public",
  sensitivity: "low",
  reviewerRole: { "zh-Hant": "在地知識持有者（待指派）", en: "Local knowledge holder (to be assigned)" },
  status: "approved",
  ...over,
});

const SRC = "戚文芬（Chi Wen-Fen），〈傳承百年的石滬文化〉（Centennial stone weir culture: Xinwu, Taoyuan as a story of human–nature harmony），林業及自然保育署 forest.gov.tw/0010173";

export const xinwuEntities: Entity[] = [
  {
    id: "X-SRC",
    nodeSlug: "xinwu",
    crmClass: "E73",
    label: { "zh-Hant": "來源報導：〈傳承百年的石滬文化〉", en: "Source reportage: Centennial stone weir culture of Xinwu" },
    description: {
      "zh-Hant": "本節點的核心敘事來源，約 4,000 字的已出版文化報導。所有紀錄都經由 PROV-O 的 wasDerivedFrom 連回這份文件。",
      en: "The core narrative source of this node: a published cultural reportage of about 4,000 characters. Every record traces back to it via PROV-O wasDerivedFrom.",
    },
    keywords: ["來源", "報導", "戚文芬", "Chi Wen-Fen", "source", "reportage", "出處"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "X-PL-XINWU",
    nodeSlug: "xinwu",
    crmClass: "E53",
    label: { "zh-Hant": "桃園市新屋區", en: "Xinwu District, Taoyuan" },
    description: {
      "zh-Hant": "本節點所在的行政區。行政區層級的地點屬於「公開」地理隱私層級。",
      en: "The administrative district of this node. Administrative-level places are in the public geo-privacy tier.",
    },
    keywords: ["新屋", "桃園", "Xinwu", "Taoyuan", "地點", "哪裡"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "PL-03",
    nodeSlug: "xinwu",
    crmClass: "E53",
    label: { "zh-Hant": "石滬故事館", en: "Stone Weir Story Hall" },
    description: {
      "zh-Hant": "石滬故事館的前身是三十幾年前的警察宿舍，民國 110 年（2021 年）改建為石滬故事館。",
      en: "The Stone Weir Story Hall was a police dormitory (警察宿舍) built over 30 years ago, converted into the Story Hall in 2021.",
    },
    keywords: ["故事館", "石滬故事館", "警察宿舍", "以前", "前身", "story hall", "police dormitory", "previous use", "former", "before"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "X-PL-RESTRICTED",
    nodeSlug: "xinwu",
    crmClass: "E53",
    label: { "zh-Hant": "石滬遺構點位（限制級）", en: "Stone weir structure coordinates (restricted)" },
    description: {
      "zh-Hant": "精確座標屬於「限制」地理隱私層級，只存在資料庫中，任何頁面與 API 都不會顯示。地圖上只呈現行政區或村級範圍。",
      en: "Precise coordinates are in the restricted geo-privacy tier: stored in the database only, never shown on any page or API. Maps show district or village-level areas only.",
    },
    keywords: ["座標", "精確位置", "在哪裡", "GPS", "coordinates", "exact location"],
    source: SRC,
    governance: gov({ geoTier: "restricted", sensitivity: "high" }),
  },
  {
    id: "OB-01",
    nodeSlug: "xinwu",
    crmClass: "E22",
    label: { "zh-Hant": "石滬／石塭", en: "Stone weir (shihhu / shihwen)" },
    description: {
      "zh-Hant": "利用潮汐捕魚的石造構造。華語稱「石滬」（shihhu），新屋客家漁業社群稱為「石塭」（shi-wen）。",
      en: "A stone structure that uses the tide to catch fish. Called 石滬 (shihhu) in Mandarin and 石塭 (shi-wen) by the Hakka fishing community of Xinwu.",
    },
    terms: [
      { term: "石塭", romanization: "shi-wen", language: "hak", gloss: "客語：石滬" },
      { term: "石滬", romanization: "shihhu", language: "zh", gloss: "華語" },
    ],
    keywords: ["石滬", "石塭", "客語", "客家話", "怎麼稱呼", "叫什麼", "stone weir", "Hakka", "Hakka term", "Hakka word", "shihwen", "shi-wen", "shihhu"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "OB-02",
    nodeSlug: "xinwu",
    crmClass: "E18",
    label: { "zh-Hant": "藻礁", en: "Algal reef" },
    description: {
      "zh-Hant": "藻礁的生長速度大約是每 10 年 1 公分。",
      en: "The algal reef grows at approximately 1 cm per 10 years.",
    },
    keywords: ["藻礁", "生長", "多快", "速度", "algal reef", "growth rate", "grow"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "OB-04",
    nodeSlug: "xinwu",
    crmClass: "E22",
    label: { "zh-Hant": "鹹醢飯", en: "Xianhaifan (salted preserved rice dish)" },
    description: {
      "zh-Hant": "以鹽、蒜與米酒製作的保存食物，記錄了漁業社群的飲食文化轉化。它同時是一道料理，也是一種保存技術；本紀錄歸類為 E22，製作程序記錄在說明中。",
      en: "A preserved food made with salt, garlic and rice wine, capturing a cultural transformation in the fishing community's foodways. It is both a dish and a preservation technique; classified as E22 with the procedure recorded in the description.",
    },
    keywords: ["鹹醢飯", "材料", "食材", "怎麼做", "料理", "xianhaifan", "ingredients", "recipe", "dish"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "X-AC-COMMUNITY",
    nodeSlug: "xinwu",
    crmClass: "E39",
    label: { "zh-Hant": "新屋客家漁業社群", en: "Hakka fishing community of Xinwu" },
    description: {
      "zh-Hant": "維繫石滬知識的客家漁業社群。他們發展出獨特的漁業詞彙，挑戰了「客家人只住在山區」的刻板印象。",
      en: "The Hakka fishing community that maintains stone weir knowledge. Their distinctive fishing vocabulary challenges the stereotype that Hakka people are exclusively mountain-dwelling.",
    },
    keywords: ["客家", "社群", "漁民", "誰", "Hakka", "community", "fishing", "山區", "刻板印象"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "X-AC-AUTHOR",
    nodeSlug: "xinwu",
    crmClass: "E39",
    label: { "zh-Hant": "戚文芬（報導作者）", en: "Chi Wen-Fen (author)" },
    description: {
      "zh-Hant": "來源報導的作者。本節點的資料以已出版且具名的報導為基礎，因此 FPIC 狀態暫記為「推定」。",
      en: "Author of the source reportage. Because the data derive from a published, attributed narrative, FPIC is currently recorded as 'assumed'.",
    },
    keywords: ["作者", "誰寫", "author", "戚文芬", "Chi Wen-Fen"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "X-AC-PATROL",
    nodeSlug: "xinwu",
    crmClass: "E39",
    label: { "zh-Hant": "石滬巡守志工", en: "Volunteer weir patrol" },
    description: {
      "zh-Hant": "早期以志工方式巡守石滬的在地群體。",
      en: "The local group that originally patrolled the weirs as volunteers.",
    },
    keywords: ["志工", "巡守", "volunteer", "patrol", "守護"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "X-AC-ASSOC",
    nodeSlug: "xinwu",
    crmClass: "E39",
    label: { "zh-Hant": "正式石滬協會", en: "Formal weir association" },
    description: {
      "zh-Hant": "由志工巡守轉型而成的正式組織。",
      en: "The formal organisation that grew out of the volunteer patrol.",
    },
    keywords: ["協會", "組織", "association", "管理", "manage"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "X-EV-GOV",
    nodeSlug: "xinwu",
    crmClass: "E5",
    label: { "zh-Hant": "從志工巡守到正式協會", en: "From volunteer patrol to formal association" },
    description: {
      "zh-Hant": "石滬的守護方式從志工巡守轉為正式協會。最小 CIDOC-CRM 子集把這段制度轉變記為一個 E5 事件；論文指出，完整模型會用 E7 活動或 P14 鏈來更細緻地描述。",
      en: "Weir stewardship shifted from volunteer patrol to a formal association. The minimal CIDOC-CRM subset records this institutional change as one E5 Event; the paper notes a full model would use E7 Activity or P14 chains.",
    },
    keywords: ["轉變", "協會", "志工", "治理", "管理", "誰管理", "維護", "守護", "governance", "transition", "who manages"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "X-EV-REUSE",
    nodeSlug: "xinwu",
    crmClass: "E5",
    label: { "zh-Hant": "警察宿舍轉為石滬故事館", en: "Police dormitory becomes the Story Hall" },
    description: {
      "zh-Hant": "原本的警察宿舍在民國 110 年（2021 年）改建為石滬故事館。",
      en: "The former police dormitory was converted into the Stone Weir Story Hall in 2021.",
    },
    keywords: ["故事館", "警察宿舍", "改建", "再利用", "story hall", "reuse"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "NE-01",
    nodeSlug: "xinwu",
    crmClass: "E73",
    label: { "zh-Hant": "敘事摘錄：「石塭」這個詞", en: "Excerpt: the word 'shi-wen'" },
    description: {
      "zh-Hant": "新屋客家人稱石滬為「石塭」。這個詞與華語「石滬」並存，在所有紀錄中都保留原文。",
      en: "The Hakka of Xinwu call the stone weir 石塭 (shi-wen). The term coexists with Mandarin 石滬 and is kept verbatim across all records.",
    },
    terms: [{ term: "石塭", romanization: "shi-wen", language: "hak" }],
    keywords: ["石塭", "客語", "客家話", "怎麼稱呼", "叫什麼", "Hakka", "Hakka term", "word", "shi-wen"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "X-NE-TIDE",
    nodeSlug: "xinwu",
    crmClass: "E73",
    label: { "zh-Hant": "漁業詞彙：「流水來」", en: "Fishing term: 'liushueilai'" },
    description: {
      "zh-Hant": "「流水來」（liushueilai）是新屋客家漁業詞彙，指漲潮。",
      en: "流水來 (liushueilai) is a Xinwu Hakka fishing term meaning the rising tide.",
    },
    terms: [{ term: "流水來", romanization: "liushueilai", language: "hak", gloss: "漲潮" }],
    keywords: ["流水來", "漲潮", "潮汐", "rising tide", "tide", "liushueilai", "詞彙"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "X-NE-IDENTITY",
    nodeSlug: "xinwu",
    crmClass: "E73",
    label: { "zh-Hant": "敘事摘錄：海邊的客家人", en: "Excerpt: Hakka of the coast" },
    description: {
      "zh-Hant": "新屋的石滬知識顯示，客家人不只住在山區，也發展出靠海維生的漁業文化與詞彙。",
      en: "Xinwu's stone weir knowledge shows that Hakka people are not only mountain dwellers; they also developed a coastal fishing culture and vocabulary.",
    },
    keywords: ["客家", "山區", "海邊", "認同", "刻板印象", "identity", "coastal", "mountain"],
    source: SRC,
    governance: gov(),
  },
  {
    id: "NE-05",
    nodeSlug: "xinwu",
    crmClass: "E73",
    label: { "zh-Hant": "敘事摘錄：以植物比喻族群認同", en: "Excerpt: a plant as a metaphor for identity" },
    description: {
      "zh-Hant": "報導中以一種植物比喻族群認同的段落。它介於 E20 生物物件與 E73 資訊物件之間；因為它的作用是敘事，所以歸類為 E73。",
      en: "A passage that uses a plant as a metaphor for ethnic identity. It sits between E20 Biological Object and E73 Information Object; classified as E73 because it functions as narrative.",
    },
    keywords: ["植物", "比喻", "認同", "metaphor", "plant", "identity"],
    source: SRC,
    governance: gov(),
  },
];

export const xinwuRelations: Relation[] = [
  { id: "r1", from: "OB-01", to: "X-PL-XINWU", property: "P53", label: { "zh-Hant": "位於", en: "located in" } },
  { id: "r2", from: "OB-01", to: "X-PL-RESTRICTED", property: "P53", label: { "zh-Hant": "精確位置（不公開）", en: "precise location (hidden)" } },
  { id: "r3", from: "OB-02", to: "X-PL-XINWU", property: "P53", label: { "zh-Hant": "位於", en: "located in" } },
  { id: "r4", from: "NE-01", to: "OB-01", property: "P67", label: { "zh-Hant": "指涉", en: "refers to" } },
  { id: "r5", from: "X-NE-TIDE", to: "OB-01", property: "P67", label: { "zh-Hant": "指涉", en: "refers to" } },
  { id: "r6", from: "OB-01", to: "X-AC-COMMUNITY", property: "P49", label: { "zh-Hant": "由…維繫", en: "kept by" } },
  { id: "r7", from: "OB-04", to: "X-AC-COMMUNITY", property: "P49", label: { "zh-Hant": "由…傳承", en: "kept by" } },
  { id: "r8", from: "X-NE-IDENTITY", to: "X-AC-COMMUNITY", property: "P67", label: { "zh-Hant": "指涉", en: "refers to" } },
  { id: "r9", from: "NE-05", to: "X-AC-COMMUNITY", property: "P67", label: { "zh-Hant": "指涉", en: "refers to" } },
  { id: "r10", from: "X-EV-GOV", to: "X-AC-PATROL", property: "P11", label: { "zh-Hant": "參與者", en: "had participant" } },
  { id: "r11", from: "X-EV-GOV", to: "X-AC-ASSOC", property: "P14", label: { "zh-Hant": "由…執行", en: "carried out by" } },
  { id: "r12", from: "X-EV-GOV", to: "X-PL-XINWU", property: "P7", label: { "zh-Hant": "發生於", en: "took place at" } },
  { id: "r13", from: "X-EV-REUSE", to: "PL-03", property: "P7", label: { "zh-Hant": "發生於", en: "took place at" } },
  { id: "r14", from: "PL-03", to: "X-PL-XINWU", property: "P89", label: { "zh-Hant": "位於", en: "falls within" } },
  { id: "r15", from: "X-SRC", to: "NE-01", property: "P165", label: { "zh-Hant": "包含", en: "incorporates" } },
  { id: "r16", from: "X-SRC", to: "X-NE-IDENTITY", property: "P165", label: { "zh-Hant": "包含", en: "incorporates" } },
  { id: "r17", from: "X-SRC", to: "NE-05", property: "P165", label: { "zh-Hant": "包含", en: "incorporates" } },
  { id: "r18", from: "X-AC-AUTHOR", to: "X-SRC", property: "P94i", label: { "zh-Hant": "撰寫", en: "authored" } },
  { id: "r19", from: "X-SRC", to: "X-NE-TIDE", property: "P165", label: { "zh-Hant": "包含", en: "incorporates" } },
];

/**
 * Baseline (ungoverned) answers recorded in the paper's offline evaluation,
 * shown side by side in the demo. Source: paper section 5.3.
 */
export const baselineAnswers: {
  match: string[];
  question: { "zh-Hant": string; en: string };
  answer: { "zh-Hant": string; en: string };
  error: { "zh-Hant": string; en: string };
}[] = [
  {
    match: ["故事館", "story hall"],
    question: { "zh-Hant": "石滬故事館以前是做什麼用的？", en: "What was the Stone Weir Story Hall used for before?" },
    answer: { "zh-Hant": "它以前可能是社區中心或行政辦公室。", en: "It was probably a former community centre or administrative office." },
    error: { "zh-Hant": "編造細節：實際是警察宿舍", en: "Fabricated detail: it was a police dormitory" },
  },
  {
    match: ["石塭", "客語", "客家話", "怎麼稱呼", "hakka term", "hakka call", "hakka people call", "the hakka call"],
    question: { "zh-Hant": "客家人怎麼稱呼石滬？", en: "What do the Hakka call stone weirs?" },
    answer: { "zh-Hant": "客家人對石滬有一個獨特的說法。", en: "The Hakka have a distinct word for stone weirs." },
    error: { "zh-Hant": "看似謹慎、實際空洞：沒有給出詞彙", en: "Confident but empty: no term is given" },
  },
  {
    match: ["藻礁", "algal"],
    question: { "zh-Hant": "藻礁長得多快？", en: "How fast does the algal reef grow?" },
    answer: { "zh-Hant": "大約每年幾公釐，或每幾十年一公分。", en: "A few millimetres per year, or roughly one centimetre every several decades." },
    error: { "zh-Hant": "數字失真：資料記載約每 10 年 1 公分", en: "Quantitative distortion: the record says about 1 cm per 10 years" },
  },
  {
    match: ["鹹醢飯", "xianhaifan"],
    question: { "zh-Hant": "鹹醢飯用哪些材料？", en: "What ingredients go into xianhaifan?" },
    answer: { "zh-Hant": "通常以鹽、蒜、米酒與醬油調味。", en: "It is usually seasoned with salt, garlic, rice wine and soy sauce." },
    error: { "zh-Hant": "成分捏造：多加了醬油", en: "Ingredient fabrication: soy sauce added" },
  },
];

/** Demo questions shown as chips, per UI language. */
export const demoQuestions = {
  "zh-Hant": [...baselineAnswers.map((b) => b.question["zh-Hant"]), "石滬的精確座標在哪裡？", "石滬是誰在管理？"],
  en: [...baselineAnswers.map((b) => b.question.en), "Where exactly are the stone weirs?", "Who manages the stone weirs?"],
};
