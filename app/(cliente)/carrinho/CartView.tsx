"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-store";
import { formatKz } from "@/lib/money";
import { Button } from "@/components/ui/Button";

export function CartView() {
  const { state, changeQty, remove, clear, subtotal, totalQty } = useCart();
  const total = subtotal + (state.deliveryFee || 0);

  if (totalQty === 0) {
    return (
      <div className="mx-auto mt-20 max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border text-text-muted">
          <ShoppingBag size={26} />
        </div>
        <h2 className="text-lg font-bold">O seu carrinho está vazio</h2>
        <p className="mt-1 text-sm text-text-muted">
          Descubra lojas e adicione pratos que deseja.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Explorar lojas</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      {state.storeName && (
        <Link
          href={`/lojas/${state.storeSlug}`}
          className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
        >
          <span className="text-text-muted">Pedido de</span>
          <span className="font-semibold">{state.storeName}</span>
        </Link>
      )}

      <ul className="flex flex-col gap-2">
        {state.items.map((it) => (
          <li key={it.productId} className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
              {it.imageUrl && <Image src={it.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 text-sm font-semibold">{it.name}</div>
              <div className="text-xs text-text-muted">{formatKz(it.price)} cada</div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => changeQty(it.productId, -1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border"
                  aria-label="Menos"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-6 text-center text-sm font-semibold">{it.qty}</span>
                <button
                  onClick={() => changeQty(it.productId, +1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-black"
                  aria-label="Mais"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => remove(it.productId)}
                  className="ml-auto text-text-muted hover:text-danger"
                  aria-label="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="self-start text-sm font-bold">{formatKz(it.price * it.qty)}</div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-card border border-border bg-surface p-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Subtotal</span>
          <span>{formatKz(subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-text-muted">Taxa de entrega</span>
          <span>{state.deliveryFee > 0 ? formatKz(state.deliveryFee) : "Grátis"}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold">
          <span>Total</span>
          <span className="text-brand">{formatKz(total)}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={clear}>Esvaziar</Button>
        <Link href="/checkout" className="flex-1">
          <Button className="w-full" size="lg">Finalizar pedido</Button>
        </Link>
      </div>
    </div>
  );
}
