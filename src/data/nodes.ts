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
    tags: ["石滬", "客家", "潮間帶", "漁業知識"],
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
    tags: ["石滬"],
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
    tags: ["石造魚梁"],
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
    tags: ["石造魚梁"],
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
    tags: ["石造魚梁"],
    status: "invited",
  },
];

export const nodeLinks: NodeLink[] = ["penghu", "okinawa", "jeju", "yap"].map((to) => ({
  from: "xinwu",
  to,
  type: "shared-theme" as const,
  label: { "zh-Hant": "共同主題：潮間帶石造漁法（邀請中）", en: "Shared theme: intertidal stone fishing (invited)" },
}));

export const getNode = (slug: string) => nodes.find((n) => n.slug === slug);

/** Clearly fake demo contacts for the admin screen. Replaced by Supabase `profiles`. */
export const demoProfiles: Profile[] = [
  { id: "d1", fullName: "示範研究者 A", email: "researcher.a@example.org", persona: "researcher", country: "JP", organization: "示範大學", interests: ["石造魚梁", "水下考古"], contactConsent: true, signupSource: "apconf2026", createdAt: "2026-11-15", tags: ["潛在共同作者"] },
  { id: "d2", fullName: "示範館員 B", email: "museum.b@example.org", persona: "museum", country: "KR", organization: "示範博物館", interests: ["展場導覽"], contactConsent: true, signupSource: "apconf2026", createdAt: "2026-11-15", tags: ["展館試用候選"] },
  { id: "d3", fullName: "示範社區成員 C", email: "community.c@example.org", persona: "community", country: "TW", interests: ["石滬", "客語"], contactConsent: false, signupSource: "direct", createdAt: "2026-11-16", nodeSlug: "xinwu" },
  { id: "d4", fullName: "示範學生 D", email: "student.d@example.org", persona: "student", country: "PH", interests: ["AI", "數位人文"], contactConsent: true, signupSource: "apconf2026", createdAt: "2026-11-17" },
];
