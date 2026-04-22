import { redirect } from "next/navigation";
import { readSession, type SessionPayload } from "./session";
import type { Role } from "./db";

export async function getSession(): Promise<SessionPayload | null> {
  return readSession();
}

export async function requireSession(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) redirect("/entrar");
  return s;
}

export async function requireRole(role: Role): Promise<SessionPayload> {
  const s = await requireSession();
  if (s.role !== role) {
    redirect(role === "vendedor" ? "/" : "/vendedor");
  }
  return s;
}
