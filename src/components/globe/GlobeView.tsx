"use client";

import Globe, { type GlobeMethods } from "react-globe.gl";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import countries110 from "world-atlas/countries-110m.json";
import type { LocalNode, NodeLink } from "@/lib/types";
import { pick, type Lang } from "@/i18n/config";

interface Props {
  nodes: LocalNode[];
  links: NodeLink[];
  selected: string | null;
  onSelect: (slug: string) => void;
  lang: Lang;
}

export default function GlobeView({ nodes, links, selected, onSelect, lang }: Props) {
  const ref = useRef<GlobeMethods | undefined>(undefined);
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  const polygons = useMemo(() => {
    const topo = countries110 as unknown as Topology<{ countries: GeometryCollection }>;
    return (feature(topo, topo.objects.countries) as unknown as { features: object[] }).features;
  }, []);

  const material = useMemo(
    () => new THREE.MeshPhongMaterial({ color: new THREE.Color("#0d2a44"), emissive: new THREE.Color("#06182a"), shininess: 12 }),
    [],
  );

  const arcs = useMemo(
    () =>
      links
        .map((l) => {
          const a = nodes.find((n) => n.slug === l.from);
          const b = nodes.find((n) => n.slug === l.to);
          return a && b ? { startLat: a.display.lat, startLng: a.display.lng, endLat: b.display.lat, endLng: b.display.lng, invited: b.status === "invited" } : null;
        })
        .filter(Boolean) as object[],
    [links, nodes],
  );

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = ref.current;
    if (!g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = g.controls();
    c.autoRotate = !reduce && !selected;
    c.autoRotateSpeed = 0.35;
    c.enableZoom = true;
    const target = nodes.find((n) => n.slug === selected);
    if (target) g.pointOfView({ lat: target.display.lat - 4, lng: target.display.lng, altitude: 1.3 }, 1200);
  }, [selected, nodes]);

  return (
    <div ref={wrap} className="absolute inset-0 md:left-[28%]">
      <Globe
        ref={ref}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={material}
        showAtmosphere
        atmosphereColor="#7bc4b2"
        atmosphereAltitude={0.18}
        onGlobeReady={() => ref.current?.pointOfView({ lat: 18, lng: 128, altitude: 2.1 }, 0)}
        polygonsData={polygons}
        polygonCapColor={() => "rgba(123,196,178,0.22)"}
        polygonSideColor={() => "rgba(0,0,0,0)"}
        polygonStrokeColor={() => "rgba(232,241,244,0.35)"}
        polygonAltitude={0.004}
        arcsData={arcs}
        arcColor={(d: object) => ((d as { invited: boolean }).invited ? ["rgba(224,120,90,0.9)", "rgba(123,196,178,0.5)"] : ["#e0785a", "#7bc4b2"])}
        arcStroke={0.9}
        arcDashLength={0.45}
        arcDashGap={0.25}
        arcDashAnimateTime={3200}
        arcAltitudeAutoScale={0.45}
        ringsData={nodes.filter((n) => n.status === "active")}
        ringLat={(d: object) => (d as LocalNode).display.lat}
        ringLng={(d: object) => (d as LocalNode).display.lng}
        ringColor={() => (t: number) => `rgba(224,120,90,${1 - t})`}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1400}
        htmlElementsData={nodes}
        htmlLat={(d: object) => (d as LocalNode).display.lat}
        htmlLng={(d: object) => (d as LocalNode).display.lng}
        htmlAltitude={0.01}
        htmlElement={(d: object) => {
          const n = d as LocalNode;
          const active = n.status === "active";
          // Put the label on the left when a neighbouring active node would collide.
          const left = !active && nodes.some((o) => o.status === "active" && Math.hypot(o.display.lat - n.display.lat, o.display.lng - n.display.lng) < 4);
          const dot = active ? 14 : 10;
          // The globe centres each HTML element on its coordinate, so the element itself is a
          // zero-size anchor: the dot's centre sits exactly on the point, the label hangs beside it.
          const el = document.createElement("button");
          el.type = "button";
          el.setAttribute("aria-label", pick(n.name, lang) || n.slug);
          el.style.cssText = "position:relative;width:0;height:0;padding:0;border:0;background:none;pointer-events:auto;cursor:pointer;overflow:visible;";
          const ring = document.createElement("span");
          ring.style.cssText = `position:absolute;left:${-dot / 2}px;top:${-dot / 2}px;width:${dot}px;height:${dot}px;box-sizing:border-box;border-radius:50%;background:${active ? "#e0785a" : "rgba(123,196,178,.25)"};border:2px solid ${active ? "#fff" : "#7bc4b2"};box-shadow:0 0 12px ${active ? "#e0785a" : "#7bc4b2"};`;
          const label = document.createElement("span");
          label.textContent = pick(n.name, lang) || n.slug;
          label.style.cssText = `position:absolute;top:-9px;${left ? `right:${dot / 2 + 5}px;` : `left:${dot / 2 + 5}px;`}white-space:nowrap;font:600 ${active ? 13 : 12}px var(--font-sans);line-height:18px;color:${active ? "#fff" : "rgba(255,255,255,.78)"};text-shadow:0 1px 4px #000;${left ? "display:none;" : ""}`;
          if (left) {
            el.title = pick(n.name, lang) || n.slug;
            el.onmouseenter = () => (label.style.display = "inline");
            el.onmouseleave = () => (label.style.display = "none");
          }
          el.append(ring, label);
          el.onclick = (e) => {
            e.stopPropagation();
            onSelect(n.slug);
          };
          return el;
        }}
      />
    </div>
  );
}
