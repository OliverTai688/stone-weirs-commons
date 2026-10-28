import { connection } from "next/server";
import { emailProvider } from "@/server/email/transport";

/** Which email transport is configured (never returns credentials). */
export async function GET() {
  await connection(); // evaluate at request time, not at build time
  return Response.json({ provider: emailProvider() ?? "none" });
}
