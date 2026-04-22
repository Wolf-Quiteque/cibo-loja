import Link from "next/link";
import { Inbox } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Badge } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth";
import { orders, stores, ObjectId, type OrderDoc } from "@/lib/db";
import { formatKz } from "@/lib/money";
import {
  orderStatusLabel,
  orderStatusTone,
  paymentMethodLabel,
  paymentStatusLabel,
  formatDate,
} from "@/lib/locale";
import { cn } from "@/lib/cn";
import { OrderActions } from "./OrderActions";

export const metadata = { title: "Pedidos recebidos" };

const ACTIVE: OrderDoc["status"][] = ["pendente", "confirmado", "preparando", "a_caminho"];

export default async function VendedorPedidosPage() {
  const session = await requireRole("vendedor");
  const store = await (await stores()).findOne({ vendorId: new ObjectId(session.sub) });
  if (!store) {
    return (
      <>
        <TopBar title="Pedidos" back="/vendedor" />
        <div className="mx-auto max-w-md px-5 pt-6 text-center text-sm text-text-muted">
          Crie a sua loja para receber pedidos.
        </div>
      </>
    );
  }

  const list = await (await orders())
    .find({ storeId: store._id })
    .sort({ createdAt: -1 })
    .limit(80)
    .toArray();

  const active = list.filter((o) => ACTIVE.includes(o.status));
  const closed = list.filter((o) => !ACTIVE.includes(o.status));

  return (
    <>
      <TopBar title="Pedidos" back="/vendedor" />
      <div className="mx-auto max-w-md px-5 pt-4">
        <Section title="Em curso" empty="Sem pedidos em curso." items={active} />
        <Section title="Histórico" empty="Sem histórico ainda." items={closed} className="mt-6" />
      </div>
    </>
  );
}

function Section({
  title,
  empty,
  items,
  className,
}: {
  title: string;
  empty: string;
  items: OrderDoc[];
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-text-muted">{title}</h2>
      {items.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-6 text-center text-sm text-text-muted">
          <Inbox size={22} className="mx-auto mb-2 text-text-dim" />
          {empty}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((o) => (
            <OrderRow key={o._id.toHexString()} order={o} />
          ))}
        </div>
      )}
    </section>
  );
}

function OrderRow({ order }: { order: OrderDoc }) {
  const orderId = order._id.toHexString();
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-text-muted">{formatDate(order.createdAt)}</div>
          <div className="truncate text-sm font-semibold">
            {order.items.length} item(s) · {formatKz(order.total)}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
            orderStatusTone[order.status],
          )}
        >
          {orderStatusLabel[order.status]}
        </span>
      </div>

      <ul className="mt-3 flex flex-col gap-1 text-xs text-text-muted">
        {order.items.slice(0, 3).map((it) => (
          <li key={it.productId.toHexString()} className="truncate">
            {it.qty}× {it.name}
          </li>
        ))}
        {order.items.length > 3 && <li>+{order.items.length - 3} outros</li>}
      </ul>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-surface-2 p-2">
          <div className="text-[10px] uppercase text-text-dim">Entrega</div>
          <div className="truncate">{order.deliveryAddress.street}</div>
          <div className="truncate text-text-muted">{order.deliveryAddress.phone}</div>
        </div>
        <div className="rounded-xl bg-surface-2 p-2">
          <div className="text-[10px] uppercase text-text-dim">Pagamento</div>
          <div className="truncate">{paymentMethodLabel[order.paymentMethod]}</div>
          <Badge
            tone={
              order.paymentStatus === "confirmado"
                ? "brand"
                : order.paymentStatus === "comprovante_enviado"
                ? "accent"
                : "warning"
            }
            className="mt-1"
          >
            {paymentStatusLabel[order.paymentStatus]}
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Link href={`/pedidos/${orderId}`} className="text-xs font-semibold text-brand">
          Ver detalhes
        </Link>
      </div>

      <OrderActions
        orderId={orderId}
        status={order.status}
        paymentStatus={order.paymentStatus}
        paymentMethod={order.paymentMethod}
        hasProof={!!order.paymentProofUrl}
      />
    </div>
  );
}
