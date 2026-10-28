"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import type { ConceptGraph as CG } from "./ConceptGraph";

type Props = ComponentProps<typeof CG>;

const ConceptGraph = dynamic(() => import("./ConceptGraph").then((m) => m.ConceptGraph), {
  ssr: false,
  loading: () => <GraphSkeleton />,
});

function GraphSkeleton({ height = 480 }: { height?: number | string }) {
  return <div style={{ height }} className="animate-pulse rounded-2xl border border-slate-200 bg-[repeating-linear-gradient(0deg,#f8fafc_0_23px,#eef2f6_23px_24px),repeating-linear-gradient(90deg,#f8fafc_0_23px,#eef2f6_23px_24px)]" />;
}

/** The graph library (~50 KB gz) is fetched only when the map comes near the viewport. */
export function LazyConceptGraph(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{near ? <ConceptGraph {...props} /> : <GraphSkeleton height={props.height} />}</div>;
}
