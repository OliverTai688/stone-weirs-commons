import "server-only";
/**
 * Data access layer.
 *
 * DEMO: reads the static seed in src/data.
 * NEXT: swap each function body for a Supabase query (see SETUP.md, step 2).
 * Pages only import from here, so nothing else has to change.
 */
import { nodes, nodeLinks, getNode as seedGetNode, demoProfiles } from "@/data/nodes";
import { xinwuEntities, xinwuRelations } from "@/data/xinwu";
import type { Entity, LocalNode, NodeLink, Profile, Relation } from "@/lib/types";

export async function listNodes(): Promise<LocalNode[]> {
  return nodes;
}
export async function listNodeLinks(): Promise<NodeLink[]> {
  return nodeLinks;
}
export async function getNode(slug: string): Promise<LocalNode | undefined> {
  return seedGetNode(slug);
}
export async function listEntities(nodeSlug: string): Promise<Entity[]> {
  return xinwuEntities.filter((e) => e.nodeSlug === nodeSlug);
}
export async function listRelations(nodeSlug: string): Promise<Relation[]> {
  const ids = new Set((await listEntities(nodeSlug)).map((e) => e.id));
  return xinwuRelations.filter((r) => ids.has(r.from) && ids.has(r.to));
}
export async function getEntity(id: string): Promise<Entity | undefined> {
  return xinwuEntities.find((e) => e.id === id);
}
/** Entities that may enter the AI index: approved and not geo-restricted. */
export async function listIndexableEntities(nodeSlugs?: string[]): Promise<Entity[]> {
  return xinwuEntities.filter(
    (e) =>
      e.governance.status === "approved" &&
      e.governance.geoTier !== "restricted" &&
      (!nodeSlugs || nodeSlugs.includes(e.nodeSlug)),
  );
}
export async function listProfiles(): Promise<Profile[]> {
  return demoProfiles;
}
export async function stats() {
  const active = nodes.filter((n) => n.status === "active");
  return {
    countries: new Set(nodes.map((n) => n.country)).size,
    activeNodes: active.length,
    invitedNodes: nodes.length - active.length,
    records: xinwuEntities.length,
  };
}
