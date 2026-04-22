import Link from "next/link";
import { Search, LogIn, User } from "lucide-react";
import { stores as storesCol } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { StoreCard } from "@/components/store/StoreCard";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function HomePage() {
  const session = await getSession();
  const col = await storesCol();
  const all = await col.find({}, { sort: { isOpen: -1, createdAt: -1 }, limit: 50 }).toArray();

  const categories = Array.from(new Set(all.map((s) => s.category).filter(Boolean)));

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1 pb-24">
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(0,230,168,0.22),transparent_70%)]" />
          <header className="relative z-10 flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top,0)+1rem)]">
            <div>
              <div className="text-xs text-text-muted">Olá{session ? "," : ""}</div>
              <div className="text-lg font-bold">
                {session ? session.name.split(" ")[0] : "Bem-vindo à Loja Cibo"}
              </div>
            </div>
            {session ? (
              <Link
                href="/conta"
                className="flex h-11 w-11 items-center justify-center rounded-full glass"
                aria-label="Conta"
              >
                <User size={20} />
              </Link>
            ) : (
              <Link
                href="/entrar"
                className="flex h-11 items-center gap-2 rounded-full glass px-4 text-sm font-semibold"
              >
                <LogIn size={16} />
                Entrar
              </Link>
            )}
          </header>

          <section className="relative z-10 px-5 pt-6">
            <h1 className="text-3xl font-black leading-tight tracking-tight">
              Comida ao <span className="text-brand">seu alcance</span>.
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Encomende nas melhores lojas perto de si. Pague na entrega ou por transferência.
            </p>

            <Link
              href="/buscar"
              className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-muted"
            >
              <Search size={18} />
              Pesquisar pratos ou lojas…
            </Link>
          </section>
        </div>

        {categories.length > 0 && (
          <section className="mt-7 px-5">
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/buscar?c=${encodeURIComponent(c)}`}
                  className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-sm"
                >
                  {c}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6 px-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Lojas em destaque</h2>
            <span className="text-xs text-text-muted">{all.length} disponíveis</span>
          </div>
          {all.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-text-muted">
              Nenhuma loja disponível de momento.
              {!session && (
                <>
                  <br />
                  <Link href="/criar-conta" className="mt-3 inline-block font-semibold text-brand">
                    Tem uma loja? Cadastre-se.
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {all.map((s) => (
                <StoreCard
                  key={s._id.toHexString()}
                  store={{
                    slug: s.slug,
                    name: s.name,
                    category: s.category,
                    description: s.description,
                    logoUrl: s.logoUrl,
                    bannerUrl: s.bannerUrl,
                    deliveryFee: s.deliveryFee,
                    isOpen: s.isOpen,
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
