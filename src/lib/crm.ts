import type { CrmClass } from "./types";

export const crmMeta: Record<CrmClass, { zh: string; en: string; color: string; bg: string }> = {
  E39: { zh: "人物／群體", en: "Actor", color: "#b45309", bg: "#fef3c7" },
  E53: { zh: "地點", en: "Place", color: "#047857", bg: "#d1fae5" },
  E5: { zh: "事件", en: "Event", color: "#7c3aed", bg: "#ede9fe" },
  E22: { zh: "人造物件", en: "Human-Made Object", color: "#1d4ed8", bg: "#dbeafe" },
  E18: { zh: "實體物", en: "Physical Thing", color: "#0e7490", bg: "#cffafe" },
  E73: { zh: "資訊物件／敘事", en: "Information Object", color: "#be185d", bg: "#fce7f3" },
};

export const crmOrder: CrmClass[] = ["E39", "E5", "E22", "E18", "E53", "E73"];
