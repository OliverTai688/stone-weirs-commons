import type { CrmClass, GeoTier, FpicStatus } from "./types";

export const crmMeta: Record<CrmClass, { zh: string; en: string; color: string; bg: string }> = {
  E39: { zh: "人物／群體", en: "Actor", color: "#b45309", bg: "#fef3c7" },
  E53: { zh: "地點", en: "Place", color: "#047857", bg: "#d1fae5" },
  E5: { zh: "事件", en: "Event", color: "#7c3aed", bg: "#ede9fe" },
  E22: { zh: "人造物件", en: "Human-Made Object", color: "#1d4ed8", bg: "#dbeafe" },
  E18: { zh: "實體物", en: "Physical Thing", color: "#0e7490", bg: "#cffafe" },
  E73: { zh: "資訊物件／敘事", en: "Information Object", color: "#be185d", bg: "#fce7f3" },
};

export const geoTierMeta: Record<GeoTier, { zh: string; desc: string }> = {
  public: { zh: "公開", desc: "行政區或基礎設施層級，可公開" },
  generalized: { zh: "概略", desc: "只顯示到村鎮層級" },
  restricted: { zh: "限制", desc: "精確座標不公開" },
};

export const fpicMeta: Record<FpicStatus, string> = {
  obtained: "已取得",
  assumed: "推定（來源為已出版、具名的報導）",
  pending: "待取得",
  withdrawn: "已撤回",
};

export const crmOrder: CrmClass[] = ["E39", "E5", "E22", "E18", "E53", "E73"];
