import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, User, Store } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth";
import { logout } from "@/actions/auth";

export const metadata = { title: "Conta" };

export default async function ContaPage() {
  const session = await getSession();
  if (!session) redirect("/entrar");

  return (
    <>
      <TopBar title="Conta" />
      <div className="mx-auto max-w-md px-5 pb-24 pt-4">
        <div className="rounded-card border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
              <User size={24} />
            </div>
            <div>
              <div className="font-bold">{session.name}</div>
              <div className="text-xs text-text-muted capitalize">{session.role}</div>
            </div>
          </div>
        </div>

        {session.role === "vendedor" && (
          <Link
            href="/vendedor"
            className="mt-4 flex items-center gap-3 rounded-card border border-border bg-surface p-4"
          >
            <Store size={18} className="text-accent" />
            <span className="font-semibold">Ir para o painel da loja</span>
          </Link>
        )}

        <form action={logout} className="mt-6">
          <Button variant="secondary" className="w-full" size="lg">
            <LogOut size={16} /> Terminar sessão
          </Button>
        </form>
      </div>
    </>
  );
}
