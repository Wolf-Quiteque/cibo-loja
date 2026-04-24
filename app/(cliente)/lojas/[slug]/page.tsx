import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { stores as storesCol, products as productsCol } from "@/lib/db";
import { TopBar } from "@/components/nav/TopBar";
import { Badge } from "@/components/ui/Card";
import { ProductCard } from "@/components/store/ProductCard";
import { formatKz } from "@/lib/money";
import { CartBar } from "@/components/cart/CartBar";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LojaPage({ params }: PageProps) {
  const { slug } = await params;
  const store = await (await storesCol()).findOne({ slug });
  if (!store) notFound();

  const items = await (await productsCol())
    .find({ storeId: store._id })
    .sort({ available: -1, category: 1, createdAt: -1 })
    .toArray();

  const grouped = items.reduce<Record<string, typeof items>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <>
      <TopBar back="/" transparent />
      <div className="-mt-14">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
          {store.bannerUrl ? (
            <Image src={store.bannerUrl} alt="" fill sizes="100vw" priority className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface to-bg" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent" />
        </div>
        <div className="px-5">
          <div className="relative -mt-12 h-20 w-20 overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-xl">
            {store.logoUrl && <Image src={store.logoUrl} alt="" fill sizes="80px" className="object-cover" />}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <h1 className="min-w-0 flex-1 truncate text-2xl font-bold">{store.name}</h1>
            {store.isOpen ? <Badge tone="brand">Aberto</Badge> : <Badge tone="danger">Fechado</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-text-muted">{store.category}</p>
          {store.description && (
            <p className="mt-3 text-sm text-text-muted">{store.description}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
              <MapPin size={12} /> {store.address}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
              <Phone size={12} /> {store.phone}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
              Entrega: {store.deliveryFee > 0 ? formatKz(store.deliveryFee) : "Grátis"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6 px-5 pb-28">
        {Object.keys(grouped).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-text-muted">
            Esta loja ainda não adicionou produtos.
          </div>
        ) : (
          Object.entries(grouped).map(([cat, prods]) => (
            <section key={cat}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-text-muted">
                {cat}
              </h2>
              <div className="flex flex-col gap-2">
                {prods.map((p) => (
                  <ProductCard
                    key={p._id.toHexString()}
                    product={{
                      id: p._id.toHexString(),
                      name: p.name,
                      description: p.description,
                      price: p.price,
                      imageUrl: p.imageUrl,
                      available: p.available && store.isOpen,
                    }}
                    storeId={store._id.toHexString()}
                    storeName={store.name}
                    storeSlug={store.slug}
                    deliveryFee={store.deliveryFee}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <CartBar storeId={store._id.toHexString()} />
    </>
  );
}
