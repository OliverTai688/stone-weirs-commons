import type { LocalNode, NodeLink, Profile } from "@/lib/types";

/**
 * Local nodes shown on the globe.
 * Only Xinwu has content. The others are "invited" regions with no records —
 * placeholders to show the bottom-up network; replace with real partner nodes.
 * Display coordinates are region-level only (geo-privacy).
 */
export const nodes: LocalNode[] = [
  {
    slug: "xinwu",
    name: { "zh-Hant": "桃園新屋客家石滬", en: "Xinwu Hakka Stone Weirs" },
    type: "community",
    country: "TW",
    countryName: { "zh-Hant": "台灣", en: "Taiwan" },
    display: { lat: 24.97, lng: 121.08 },
    geoTier: "generalized",
    languages: ["hak", "zh-Hant", "en"],
    summary: {
      "zh-Hant": "第一個在地節點。以新屋客家漁業社群的石滬（石塭）敘事為核心，建立經治理的 CIDOC-CRM 紀錄與 AI 問答。",
      en: "The first local node: governed CIDOC-CRM records and AI Q&A built from the stone weir (shi-wen) narratives of Xinwu's Hakka fishing community.",
    },
    tags: [{ "zh-Hant": "石滬", en: "stone weirs" }, { "zh-Hant": "客家", en: "Hakka" }, { "zh-Hant": "潮間帶", en: "intertidal" }, { "zh-Hant": "漁業知識", en: "fishing knowledge" }],
    status: "active",
  },
  {
    slug: "penghu",
    name: { "zh-Hant": "澎湖（邀請中）", en: "Penghu (invited)" },
    type: "community",
    country: "TW",
    countryName: { "zh-Hant": "台灣", en: "Taiwan" },
    display: { lat: 23.57, lng: 119.58 },
    geoTier: "public",
    languages: ["zh-Hant"],
    summary: { "zh-Hant": "邀請在地社群或研究團隊建立節點。", en: "Inviting local communities or research teams to create this node." },
    tags: [{ "zh-Hant": "石滬", en: "stone weirs" }],
    status: "invited",
  },
  {
    slug: "okinawa",
    name: { "zh-Hant": "沖繩（邀請中）", en: "Okinawa (invited)" },
    type: "research",
    country: "JP",
    countryName: { "zh-Hant": "日本", en: "Japan" },
    display: { lat: 26.33, lng: 127.8 },
    geoTier: "public",
    languages: ["ja"],
    summary: { "zh-Hant": "邀請在地社群或研究團隊建立節點。", en: "Inviting local communities or research teams to create this node." },
    tags: [{ "zh-Hant": "石造魚梁", en: "stone fish traps" }],
    status: "invited",
  },
  {
    slug: "jeju",
    name: { "zh-Hant": "濟州（邀請中）", en: "Jeju (invited)" },
    type: "research",
    country: "KR",
    countryName: { "zh-Hant": "韓國", en: "Korea" },
    display: { lat: 33.38, lng: 126.55 },
    geoTier: "public",
    languages: ["ko"],
    summary: { "zh-Hant": "邀請在地社群或研究團隊建立節點。", en: "Inviting local communities or research teams to create this node." },
    tags: [{ "zh-Hant": "石造魚梁", en: "stone fish traps" }],
    status: "invited",
  },
  {
    slug: "yap",
    name: { "zh-Hant": "雅浦（邀請中）", en: "Yap (invited)" },
    type: "community",
    country: "FM",
    countryName: { "zh-Hant": "密克羅尼西亞", en: "Micronesia" },
    display: { lat: 9.53, lng: 138.13 },
    geoTier: "public",
    languages: ["en"],
    summary: { "zh-Hant": "邀請在地社群或研究團隊建立節點。", en: "Inviting local communities or research teams to create this node." },
    tags: [{ "zh-Hant": "石造魚梁", en: "stone fish traps" }],
    status: "invited",
  },
  {
    slug: "philippines",
    name: { "zh-Hant": "菲律賓（邀請中）", en: "Philippines (invited)" },
    type: "research",
    country: "PH",
    countryName: { "zh-Hant": "菲律賓", en: "Philippines" },
    display: { lat: 12.9, lng: 121.8 },
    geoTier: "public",
    languages: ["fil", "en"],
    summary: { "zh-Hant": "邀請在地社群或研究團隊建立節點。", en: "Inviting local communities or research teams to create this node." },
    tags: [{ "zh-Hant": "潮間帶漁法", en: "intertidal fishing" }],
    status: "invited",
  },
  {
    slug: "indonesia",
    name: { "zh-Hant": "印尼（邀請中）", en: "Indonesia (invited)" },
    type: "research",
    country: "ID",
    countryName: { "zh-Hant": "印尼", en: "Indonesia" },
    display: { lat: -0.79, lng: 113.92 },
    geoTier: "public",
    languages: ["id", "en"],
    summary: { "zh-Hant": "邀請在地社群或研究團隊建立節點。", en: "Inviting local communities or research teams to create this node." },
    tags: [{ "zh-Hant": "潮間帶漁法", en: "intertidal fishing" }],
    status: "invited",
  },
];

export const nodeLinks: NodeLink[] = ["penghu", "okinawa", "jeju", "yap", "philippines", "indonesia"].map((to) => ({
  from: "xinwu",
  to,
  type: "shared-theme" as const,
  label: { "zh-Hant": "共同主題：潮間帶石造漁法（邀請中）", en: "Shared theme: intertidal stone fishing (invited)" },
}));

export const getNode = (slug: string) => nodes.find((n) => n.slug === slug);

/** Clearly fake demo contacts for the admin screen. Replaced by Supabase `profiles`. */
export const demoProfiles: Profile[] = [
  { id: "d1", fullName: "Demo Researcher A", email: "researcher.a@example.org", persona: "researcher", country: "JP", organization: "Demo University", interests: ["stone fish traps", "underwater archaeology"], contactConsent: true, signupSource: "apconf2026", createdAt: "2026-11-15", tags: ["potential co-author"] },
  { id: "d2", fullName: "Demo Curator B", email: "museum.b@example.org", persona: "museum", country: "KR", organization: "Demo Museum", interests: ["exhibit guides"], contactConsent: true, signupSource: "apconf2026", createdAt: "2026-11-15", tags: ["pilot candidate"] },
  { id: "d3", fullName: "Demo Community Member C", email: "community.c@example.org", persona: "community", country: "TW", interests: ["stone weirs", "Hakka"], contactConsent: false, signupSource: "direct", createdAt: "2026-11-16", nodeSlug: "xinwu" },
  { id: "d4", fullName: "Demo Student D", email: "student.d@example.org", persona: "student", country: "PH", interests: ["AI", "digital humanities"], contactConsent: true, signupSource: "apconf2026", createdAt: "2026-11-17" },
];
