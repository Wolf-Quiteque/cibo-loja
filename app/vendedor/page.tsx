import Link from "next/link";
import { ArrowRight, LogOut, ShoppingBag, Store as StoreIcon, UtensilsCrossed, Wallet, CircleAlert } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Badge } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth";
import { stores, products, orders, ObjectId } from "@/lib/db";
import { formatKz } from "@/lib/money";
import { orderStatusLabel, orderStatusTone, formatDate } from "@/lib/locale";
import { cn } from "@/lib/cn";
import { toggleStoreOpen } from "@/actions/stores";
import { logout } from "@/actions/auth";

function SignOutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        aria-label="Terminar sessão"
        className="flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-text-muted hover:bg-white/5 hover:text-text"
      >
        <LogOut size={16} />
        <span>Sair</span>
      </button>
    </form>
  );
}

export const metadata = { title: "Painel do vendedor" };

export default async function VendedorHomePage() {
  const session = await requireRole("vendedor");
  const vendorId = new ObjectId(session.sub);

  const store = await (await stores()).findOne({ vendorId });

  if (!store) {
    return (
      <>
        <TopBar title="Bem-vindo" right={<SignOutButton />} />
        <div className="mx-auto max-w-md px-5 pt-6">
          <div className="rounded-card border border-border bg-surface p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <StoreIcon size={24} />
            </div>
            <h2 className="text-lg font-bold">Crie a sua loja</h2>
            <p className="mt-1 text-sm text-text-muted">
              Comece por configurar o nome, logótipo e detalhes de entrega.
            </p>
            <Link
              href="/vendedor/loja"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-black"
            >
              Configurar loja <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </>
    );
  }

  const [productCount, ordersList, pendingProofs] = await Promise.all([
    (await products()).countDocuments({ storeId: store._id }),
    (await orders())
      .find({ storeId: store._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray(),
    (await orders()).countDocuments({
      storeId: store._id,
      paymentStatus: "comprovante_enviado",
    }),
  ]);

  const todaysStart = new Date();
  todaysStart.setHours(0, 0, 0, 0);
  const todayStats = await (await orders())
    .aggregate<{ _id: null; total: number; count: number }>([
      { $match: { storeId: store._id, createdAt: { $gte: todaysStart }, status: { $ne: "cancelado" } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ])
    .toArray();
  const todayRevenue = todayStats[0]?.total ?? 0;
  const todayCount = todayStats[0]?.count ?? 0;

  return (
    <>
      <TopBar title="Painel" right={<SignOutButton />} />
      <div className="mx-auto max-w-md px-5 pt-4">
        <div className="rounded-card border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="truncate text-lg font-bold">{store.name}</div>
              <div className="truncate text-xs text-text-muted">{store.category}</div>
            </div>
            <form action={toggleStoreOpen}>
              <button
                type="submit"
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  store.isOpen
                    ? "border-brand/30 bg-brand/15 text-brand"
                    : "border-danger/30 bg-danger/15 text-danger",
                )}
              >
                {store.isOpen ? "Aberto" : "Fechado"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard icon={<Wallet size={18} />} label="Vendas hoje" value={formatKz(todayRevenue)} />
          <StatCard icon={<ShoppingBag size={18} />} label="Pedidos hoje" value={String(todayCount)} />
          <StatCard icon={<UtensilsCrossed size={18} />} label="Produtos" value={String(productCount)} />
          <StatCard
            icon={<CircleAlert size={18} />}
            label="Comprovativos"
            value={String(pendingProofs)}
            tone={pendingProofs > 0 ? "accent" : "neutral"}
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">Últimos pedidos</h2>
          <Link href="/vendedor/pedidos" className="text-xs font-semibold text-brand">
            Ver todos
          </Link>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          {ordersList.length === 0 ? (
            <div className="rounded-card border border-dashed border-border p-6 text-center text-sm text-text-muted">
              Ainda sem pedidos.
            </div>
          ) : (
            ordersList.map((o) => (
              <Link
                key={o._id.toHexString()}
                href={`/pedidos/${o._id.toHexString()}`}
                className="flex items-center justify-between rounded-card border border-border bg-surface p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {o.items.length} item(s) · {formatKz(o.total)}
                  </div>
                  <div className="truncate text-xs text-text-muted">{formatDate(o.createdAt)}</div>
                </div>
                <Badge tone="neutral" className={cn("capitalize", orderStatusTone[o.status])}>
                  {orderStatusLabel[o.status]}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "neutral" | "accent";
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-3">
      <div
        className={cn(
          "mb-1 flex h-8 w-8 items-center justify-center rounded-xl",
          tone === "accent" ? "bg-accent/15 text-accent" : "bg-surface-2 text-text-muted",
        )}
      >
        {icon}
      </div>
      <div className="text-xs text-text-muted">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}
