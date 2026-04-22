"use client";

import { useTransition } from "react";
import { Check, X, ChefHat, Bike, PackageCheck, BadgeCheck } from "lucide-react";
import { confirmPayment, updateOrderStatus } from "@/actions/orders";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/db";
import { cn } from "@/lib/cn";

interface Props {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  hasProof: boolean;
}

const NEXT_LABEL: Partial<Record<OrderStatus, { next: OrderStatus; label: string; icon: React.ReactNode }>> = {
  pendente: { next: "confirmado", label: "Confirmar", icon: <Check size={14} /> },
  confirmado: { next: "preparando", label: "Iniciar preparo", icon: <ChefHat size={14} /> },
  preparando: { next: "a_caminho", label: "Saiu para entrega", icon: <Bike size={14} /> },
  a_caminho: { next: "entregue", label: "Marcar entregue", icon: <PackageCheck size={14} /> },
};

export function OrderActions({ orderId, status, paymentStatus, paymentMethod, hasProof }: Props) {
  const [pending, start] = useTransition();
  const advance = NEXT_LABEL[status];
  const canCancel = status === "pendente" || status === "confirmado" || status === "preparando";
  const showConfirmPayment =
    paymentMethod === "transferencia" && hasProof && paymentStatus !== "confirmado";

  if (!advance && !canCancel && !showConfirmPayment) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {showConfirmPayment && (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => confirmPayment(orderId))}
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent",
            pending && "opacity-50",
          )}
        >
          <BadgeCheck size={14} /> Confirmar pagamento
        </button>
      )}
      {advance && (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => updateOrderStatus(orderId, advance.next))}
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-black",
            pending && "opacity-50",
          )}
        >
          {advance.icon} {advance.label}
        </button>
      )}
      {canCancel && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("Cancelar este pedido?")) start(() => updateOrderStatus(orderId, "cancelado"));
          }}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger",
            pending && "opacity-50",
          )}
        >
          <X size={14} /> Cancelar
        </button>
      )}
    </div>
  );
}
