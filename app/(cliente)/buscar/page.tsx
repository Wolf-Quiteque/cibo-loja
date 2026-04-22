import { TopBar } from "@/components/nav/TopBar";
import { stores as storesCol, products as productsCol } from "@/lib/db";
import { StoreCard } from "@/components/store/StoreCard";
import { formatKz } from "@/lib/money";
import Image from "next/image";

export const metadata = { title: "Buscar" };

interface Props {
  searchParams: Promise<{ q?: string; c?: string }>;
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q = "", c = "" } = await searchParams;
  const query = q.trim();

  const storeFilter: Record<string, unknown> = {};
  if (c) storeFilter.category = c;
  if (query) {
    const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    storeFilter.$or = [{ name: re }, { description: re }, { category: re }];
  }

  const [stores, products] = await Promise.all([
    (await storesCol()).find(storeFilter, { limit: 40, sort: { isOpen: -1 } }).toArray(),
    query
      ? (await productsCol())
          .find(
            {
              available: true,
              $or: [
                { name: new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
              ],
            },
            { limit: 20 },
          )
          .toArray()
      : Promise.resolve([]),
  ]);

  const storeById = new Map((await (await storesCol()).find({}).toArray()).map((s) => [s._id.toHexString(), s]));

  return (
    <>
      <TopBar title="Buscar" back="/" />
      <div className="mx-auto max-w-2xl px-5 pb-24 pt-4">
        <form action="/buscar" method="get" className="mb-4">
          <input
            name="q"
            defaultValue={query}
            placeholder="Pesquisar pratos ou lojas…"
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-text-dim focus:border-brand/60"
          />
          {c && <input type="hidden" name="c" value={c} />}
        </form>

        {c && <div className="mb-3 text-xs text-text-muted">Categoria: <span className="text-white">{c}</span></div>}

        {products.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-text-muted">Pratos</h2>
            <div className="flex flex-col gap-2">
              {products.map((p) => {
                const store = storeById.get(p.storeId.toHexString());
                if (!store) return null;
                return (
                  <a
                    key={p._id.toHexString()}
                    href={`/lojas/${store.slug}`}
                    className="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                      {p.imageUrl && <Image src={p.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{p.name}</div>
                      <div className="truncate text-xs text-text-muted">{store.name}</div>
                    </div>
                    <div className="font-bold text-brand">{formatKz(p.price)}</div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-text-muted">Lojas</h2>
          {stores.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-text-muted">
              Nenhum resultado.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {stores.map((s) => (
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
      </div>
    </>
  );
}
