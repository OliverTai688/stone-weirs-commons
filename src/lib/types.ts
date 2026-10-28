export type Locale = "zh-Hant" | "en";
export type I18nText = Partial<Record<Locale | string, string>>;

export type CrmClass = "E39" | "E53" | "E5" | "E22" | "E18" | "E73";
export type GeoTier = "public" | "generalized" | "restricted";
export type FpicStatus = "obtained" | "assumed" | "pending" | "withdrawn";
export type Sensitivity = "low" | "medium" | "high";
export type GovStatus = "draft" | "in_review" | "approved" | "withdrawn";

export interface Governance {
  fpic: FpicStatus;
  license: I18nText;
  geoTier: GeoTier;
  sensitivity: Sensitivity;
  reviewerRole: I18nText;
  status: GovStatus;
}

export interface Entity {
  id: string; // e.g. PL-03
  nodeSlug: string;
  crmClass: CrmClass;
  label: I18nText;
  description: I18nText;
  terms?: { term: string; romanization?: string; language: string; gloss?: string }[];
  keywords: string[]; // retrieval hints (zh + en)
  source: string; // provenance: wasDerivedFrom
  governance: Governance;
}

export interface Relation {
  id: string;
  from: string;
  to: string;
  property: string; // CIDOC-CRM property code
  label: I18nText;
}

export type NodeType = "community" | "museum" | "research" | "government";
export type NodeStatus = "active" | "invited";

export interface LocalNode {
  slug: string;
  name: I18nText;
  type: NodeType;
  country: string; // ISO 3166
  countryName: I18nText;
  /** privacy-processed display coordinates (never precise for generalized/restricted) */
  display: { lat: number; lng: number };
  geoTier: GeoTier;
  languages: string[];
  summary: I18nText;
  tags: I18nText[];
  status: NodeStatus;
}

export interface NodeLink {
  from: string;
  to: string;
  type: "shared-theme" | "cross-research" | "citation";
  label: I18nText;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  persona: "researcher" | "museum" | "community" | "student" | "other";
  country: string;
  organization?: string;
  interests: string[];
  contactConsent: boolean;
  signupSource: string;
  createdAt: string;
  nodeSlug?: string;
  tags?: string[];
}
