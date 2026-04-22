import Link from "next/link";
import { redirect } from "next/navigation";
import { Receipt } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { Badge } from "@/components/ui/Card";
import { getSession } from "@/lib/auth";
import { orders, ObjectId } from "@/lib/db";
import { formatKz } from "@/lib/money";
import { orderStatusLabel, orderStatusTone, formatDate } from "@/lib/locale";
import { cn } from "@/lib/cn";

export const metadata = { title: "Os meus pedidos" };

export default async function PedidosPage() {
  const session = await getSession();
  if (!session) redirect("/entrar");
  if (session.role !== "cliente") redirect("/vendedor/pedidos");

  const list = await (await orders())
    .find({ clientId: new ObjectId(session.sub) })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return (
    <>
      <TopBar title="Os meus pedidos" />
      <div className="px-5 pb-24 pt-4">
        {list.length === 0 ? (
          <div className="mx-auto mt-16 max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border text-text-muted">
              <Receipt size={26} />
            </div>
            <h2 className="text-lg font-bold">Ainda sem pedidos</h2>
            <p className="mt-1 text-sm text-text-muted">Quando fizer um pedido, aparecerá aqui.</p>
          </div>
        ) : (
          <ul className="mx-auto flex max-w-md flex-col gap-2">
            {list.map((o) => (
              <li key={o._id.toHexString()}>
                <Link
                  href={`/pedidos/${o._id.toHexString()}`}
                  className="block rounded-card border border-border bg-surface p-4 transition-colors hover:border-brand/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{o.storeName}</div>
                    <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", orderStatusTone[o.status])}>
                      {orderStatusLabel[o.status]}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-text-muted">
                    <span>{formatDate(o.createdAt)}</span>
                    <span>{o.items.reduce((s, i) => s + i.qty, 0)} item(ns)</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-text-muted">
                      {o.paymentMethod === "dinheiro_na_entrega" ? "Dinheiro na entrega" : "Transferência"}
                    </span>
                    <span className="font-bold">{formatKz(o.total)}</span>
                  </div>
                  {o.paymentMethod === "transferencia" && o.paymentStatus !== "confirmado" && (
                    <div className="mt-2">
                      <Badge tone={o.paymentStatus === "aguardando" ? "warning" : "accent"}>
                        {o.paymentStatus === "aguardando" ? "Envie comprovativo" : "Aguarda confirmação"}
                      </Badge>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
