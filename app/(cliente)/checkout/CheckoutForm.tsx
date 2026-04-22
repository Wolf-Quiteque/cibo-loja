"use client";

import { useActionState, useState } from "react";
import { MapPin, Phone, StickyNote, Banknote, Landmark } from "lucide-react";
import { useCart } from "@/components/cart/cart-store";
import { Input, Textarea } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { placeOrder, type OrderActionState } from "@/actions/orders";
import { formatKz } from "@/lib/money";
import { cn } from "@/lib/cn";

export function CheckoutForm() {
  const { state, subtotal, totalQty } = useCart();
  const [payment, setPayment] = useState<"dinheiro_na_entrega" | "transferencia">("dinheiro_na_entrega");
  const [result, action] = useActionState<OrderActionState, FormData>(placeOrder, null);

  const total = subtotal + (state.deliveryFee || 0);

  if (totalQty === 0 || !state.storeId) {
    return (
      <div className="mt-10 text-center text-text-muted">
        O carrinho está vazio.
      </div>
    );
  }

  const itemsPayload = JSON.stringify(state.items.map((i) => ({ productId: i.productId, qty: i.qty })));

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="storeId" value={state.storeId} />
      <input type="hidden" name="items" value={itemsPayload} />

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          Endereço de entrega
        </h2>
        <div className="flex flex-col gap-3">
          <Input name="street" label="Rua / número" placeholder="Ex: Rua Amílcar Cabral, 12" required left={<MapPin size={16} />} />
          <Input name="city" label="Bairro / cidade" placeholder="Ex: Maianga, Luanda" required />
          <Input name="phone" label="Telefone de contacto" placeholder="9XX XXX XXX" inputMode="numeric" required left={<Phone size={16} />} />
          <Textarea name="notes" label="Referência / notas" placeholder="Prédio azul, 2º andar…" />
          <input type="hidden" name="paymentMethod" value={payment} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-text-muted">
          Forma de pagamento
        </h2>
        <div className="grid grid-cols-1 gap-2">
          <PayOption
            active={payment === "dinheiro_na_entrega"}
            onClick={() => setPayment("dinheiro_na_entrega")}
            icon={<Banknote size={18} />}
            title="Dinheiro na entrega"
            desc="Pague em notas ao estafeta quando chegar."
          />
          <PayOption
            active={payment === "transferencia"}
            onClick={() => setPayment("transferencia")}
            icon={<Landmark size={18} />}
            title="Transferência bancária"
            desc="Faça a transferência e envie o comprovativo após o pedido."
          />
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface p-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Subtotal</span>
          <span>{formatKz(subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-text-muted">Entrega</span>
          <span>{state.deliveryFee > 0 ? formatKz(state.deliveryFee) : "Grátis"}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold">
          <span>Total</span>
          <span className="text-brand">{formatKz(total)}</span>
        </div>
      </section>

      {result?.error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {result.error}
        </div>
      )}

      <SubmitButton size="lg" className="w-full">
        <StickyNote size={18} /> Confirmar pedido · {formatKz(total)}
      </SubmitButton>
    </form>
  );
}

function PayOption({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border bg-surface px-4 py-3 text-left transition-colors",
        active ? "border-brand/60 bg-brand/5" : "border-border",
      )}
    >
      <span className={cn("mt-0.5", active ? "text-brand" : "text-text-muted")}>{icon}</span>
      <span className="flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-xs text-text-muted">{desc}</span>
      </span>
      <span
        className={cn(
          "mt-1 h-4 w-4 shrink-0 rounded-full border",
          active ? "border-brand bg-brand" : "border-border",
        )}
      />
    </button>
  );
}
