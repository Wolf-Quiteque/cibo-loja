import Link from "next/link";
import Image from "next/image";
import { Plus, UtensilsCrossed } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Badge } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth";
import { products, stores, ObjectId } from "@/lib/db";
import { formatKz } from "@/lib/money";

export const metadata = { title: "Produtos" };

export default async function VendedorProdutosPage() {
  const session = await requireRole("vendedor");
  const store = await (await stores()).findOne({ vendorId: new ObjectId(session.sub) });

  if (!store) {
    return (
      <>
        <TopBar title="Produtos" back="/vendedor" />
        <div className="mx-auto max-w-md px-5 pt-6 text-center">
          <p className="text-sm text-text-muted">Crie primeiro a sua loja.</p>
          <Link
            href="/vendedor/loja"
            className="mt-4 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-black"
          >
            Configurar loja
          </Link>
        </div>
      </>
    );
  }

  const list = await (await products()).find({ storeId: store._id }).sort({ createdAt: -1 }).toArray();

  return (
    <>
      <TopBar
        title="Produtos"
        back="/vendedor"
        right={
          <Link
            href="/vendedor/produtos/novo"
            className="flex h-10 items-center gap-1 rounded-full bg-brand px-3 text-xs font-bold text-black"
          >
            <Plus size={16} /> Novo
          </Link>
        }
      />
      <div className="mx-auto max-w-md px-5 pt-4">
        {list.length === 0 ? (
          <div className="rounded-card border border-dashed border-border p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-text-muted">
              <UtensilsCrossed size={20} />
            </div>
            <p className="text-sm text-text-muted">Ainda sem produtos.</p>
            <Link
              href="/vendedor/produtos/novo"
              className="mt-4 inline-flex items-center gap-1 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-black"
            >
              <Plus size={16} /> Adicionar produto
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((p) => (
              <Link
                key={p._id.toHexString()}
                href={`/vendedor/produtos/${p._id.toHexString()}`}
                className="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                  {p.imageUrl && <Image src={p.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="truncate text-xs text-text-muted">{p.category}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-brand">{formatKz(p.price)}</span>
                    {!p.available && <Badge tone="danger">Indisponível</Badge>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
