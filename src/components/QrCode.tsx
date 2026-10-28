"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** QR code for an absolute URL on this site (origin resolved in the browser). */
export function QrCode({ path }: { path: string }) {
  const [qr, setQr] = useState({ svg: "", url: "" });
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const u = `${base}${path}`;
    QRCode.toString(u, { type: "svg", margin: 1, color: { dark: "#0f1e2e", light: "#ffffff" } }).then((svg) => setQr({ svg, url: u }));
  }, [path]);
  return qr.svg ? <div aria-label={`QR code: ${qr.url}`} dangerouslySetInnerHTML={{ __html: qr.svg }} /> : <div className="aspect-square w-full animate-pulse rounded bg-slate-100" />;
}
