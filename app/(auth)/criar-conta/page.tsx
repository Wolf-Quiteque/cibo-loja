import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "./SignupForm";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Criar conta" };

export default async function CriarContaPage() {
  const session = await getSession();
  if (session) redirect(session.role === "vendedor" ? "/vendedor" : "/");

  return (
    <div className="mx-auto mt-6 max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="mt-1 text-sm text-text-muted">
          Comece em menos de um minuto.
        </p>
      </div>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-text-muted">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-brand">
          Entrar
        </Link>
      </p>
    </div>
  );
}
