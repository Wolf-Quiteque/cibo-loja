"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { users, ObjectId } from "@/lib/db";
import { signupSchema, loginSchema } from "@/lib/validation";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";

export type AuthState = { error?: string } | null;

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    role: formData.get("role"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const col = await users();
  const existing = await col.findOne({ phone: parsed.data.phone });
  if (existing) return { error: "Já existe uma conta com este telefone" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const now = new Date();
  const _id = new ObjectId();
  await col.insertOne({
    _id,
    role: parsed.data.role,
    name: parsed.data.name,
    phone: parsed.data.phone,
    passwordHash,
    createdAt: now,
  });

  await setSessionCookie({ sub: _id.toHexString(), role: parsed.data.role, name: parsed.data.name });
  redirect(parsed.data.role === "vendedor" ? "/vendedor" : "/");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const col = await users();
  const user = await col.findOne({ phone: parsed.data.phone });
  if (!user) return { error: "Telefone ou senha incorretos" };

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return { error: "Telefone ou senha incorretos" };

  await setSessionCookie({
    sub: user._id.toHexString(),
    role: user.role,
    name: user.name,
  });
  redirect(user.role === "vendedor" ? "/vendedor" : "/");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
