"use client";

import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { formatKz } from "@/lib/money";
import { useCart } from "@/components/cart/cart-store";

interface Props {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    available: boolean;
  };
  storeId: string;
  storeName: string;
  storeSlug: string;
  deliveryFee: number;
}

export function ProductCard({ product, storeId, storeName, storeSlug, deliveryFee }: Props) {
  const cart = useCart();
  const qty = cart.state.storeId === storeId
    ? cart.state.items.find((i) => i.productId === product.id)?.qty ?? 0
    : 0;

  const add = () => {
    cart.add({
      storeId,
      storeName,
      storeSlug,
      deliveryFee,
      item: { productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl },
    });
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(8);
  };

  const inc = () => cart.changeQty(product.id, +1);
  const dec = () => cart.changeQty(product.id, -1);

  return (
    <div className="flex gap-3 rounded-card border border-border bg-surface p-3">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt="" fill sizes="96px" className="object-cover" />
        ) : null}
        {!product.available && (
          <div className="absolute inset-0 grid place-items-center bg-black/60 text-[10px] font-semibold uppercase text-white">
            Esgotado
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="line-clamp-1 font-semibold">{product.name}</div>
        {product.description && (
          <div className="line-clamp-2 text-xs text-text-muted">{product.description}</div>
        )}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="truncate text-lg font-bold text-brand">{formatKz(product.price)}</div>
          {qty > 0 ? (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={dec}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-white"
                aria-label="Remover"
              >
                <Minus size={16} />
              </button>
              <span className="flex-1 text-center text-sm font-semibold">{qty}</span>
              <button
                type="button"
                onClick={inc}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-black"
                aria-label="Adicionar"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={add}
              disabled={!product.available}
              className="flex h-9 w-full items-center justify-center gap-1 rounded-full bg-brand text-xs font-bold text-black disabled:opacity-40"
            >
              <Plus size={14} /> Adicionar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
