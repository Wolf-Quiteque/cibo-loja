import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Entrar" };

export default async function EntrarPage() {
  const session = await getSession();
  if (session) redirect(session.role === "vendedor" ? "/vendedor" : "/");

  return (
    <div className="mx-auto mt-6 max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand glow-brand">
          <span className="text-xl font-black">C</span>
        </div>
        <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-text-muted">
          Entre para continuar a pedir.
        </p>
      </div>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-text-muted">
        Ainda não tem conta?{" "}
        <Link href="/criar-conta" className="font-semibold text-brand">
          Criar agora
        </Link>
      </p>
    </div>
  );
}
