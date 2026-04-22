import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MapPin, Phone, Clock } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { orders, ObjectId } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatKz } from "@/lib/money";
import {
  orderStatusLabel,
  orderStatusTone,
  orderStatusFlow,
  paymentMethodLabel,
  paymentStatusLabel,
  formatDate,
} from "@/lib/locale";
import { ClearCartAfterOrder } from "@/components/cart/ClearCartAfterOrder";
import { PaymentProofUploader } from "@/components/payment/PaymentProofUploader";
import { cn } from "@/lib/cn";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PedidoDetalhePage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/entrar");

  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    notFound();
  }

  const order = await (await orders()).findOne({ _id: oid });
  if (!order) notFound();
  if (session.role === "cliente" && !order.clientId.equals(new ObjectId(session.sub))) notFound();

  const flowIndex = orderStatusFlow.indexOf(order.status);

  return (
    <>
      <TopBar title="Pedido" back="/pedidos" />
      <ClearCartAfterOrder />
      <div className="mx-auto max-w-md px-5 pb-24 pt-4">
        <div className="rounded-card border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-text-muted">Pedido em</div>
              <div className="font-semibold">{formatDate(order.createdAt)}</div>
            </div>
            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", orderStatusTone[order.status])}>
              {orderStatusLabel[order.status]}
            </span>
          </div>
          {order.status !== "cancelado" && (
            <div className="mt-4">
              <div className="flex items-center">
                {orderStatusFlow.map((s, i) => {
                  const active = i <= flowIndex && flowIndex >= 0;
                  return (
                    <div key={s} className="flex flex-1 items-center">
                      <div
                        className={cn(
                          "flex h-2 flex-1 rounded-full",
                          i === 0 ? "ml-0" : "",
                          active ? "bg-brand" : "bg-border",
                        )}
                      />
                      {i < orderStatusFlow.length - 1 && <div className="w-0.5" />}
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
                <Clock size={12} />
                Atualizado {formatDate(order.updatedAt)}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-card border border-border bg-surface p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-text-muted">Loja</div>
          <div className="font-semibold">{order.storeName}</div>
        </div>

        <div className="mt-4 rounded-card border border-border bg-surface p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">Itens</div>
          <ul className="flex flex-col gap-2">
            {order.items.map((it) => (
              <li key={it.productId.toHexString()} className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-semibold">{it.qty}×</span> {it.name}
                </span>
                <span>{formatKz(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-text-muted"><span>Subtotal</span><span>{formatKz(order.subtotal)}</span></div>
            <div className="flex justify-between text-text-muted"><span>Entrega</span><span>{order.deliveryFee > 0 ? formatKz(order.deliveryFee) : "Grátis"}</span></div>
            <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span><span className="text-brand">{formatKz(order.total)}</span></div>
          </div>
        </div>

        <div className="mt-4 rounded-card border border-border bg-surface p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">Entrega</div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin size={16} className="mt-0.5 text-text-muted" />
            <div>
              <div>{order.deliveryAddress.street}</div>
              <div className="text-text-muted">{order.deliveryAddress.city}</div>
              {order.deliveryAddress.notes && (
                <div className="mt-1 text-xs text-text-muted">Nota: {order.deliveryAddress.notes}</div>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Phone size={16} className="text-text-muted" />
            {order.deliveryAddress.phone}
          </div>
        </div>

        <div className="mt-4 rounded-card border border-border bg-surface p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">Pagamento</div>
          <div className="flex items-center justify-between text-sm">
            <span>{paymentMethodLabel[order.paymentMethod]}</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                order.paymentStatus === "confirmado"
                  ? "bg-brand/15 text-brand"
                  : order.paymentStatus === "comprovante_enviado"
                  ? "bg-accent/15 text-accent"
                  : "bg-warning/15 text-warning",
              )}
            >
              {paymentStatusLabel[order.paymentStatus]}
            </span>
          </div>

          {order.paymentMethod === "transferencia" && (
            <div className="mt-4">
              {order.paymentProofUrl ? (
                <div>
                  <div className="text-xs text-text-muted mb-2">Comprovativo enviado:</div>
                  <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="relative block aspect-[3/4] max-h-80 overflow-hidden rounded-xl border border-border">
                    <Image src={order.paymentProofUrl} alt="Comprovativo" fill sizes="400px" className="object-contain" />
                  </a>
                </div>
              ) : session.role === "cliente" ? (
                <PaymentProofUploader orderId={order._id.toHexString()} />
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/pedidos" className="text-sm text-text-muted underline">Voltar aos pedidos</Link>
        </div>
      </div>
    </>
  );
}
