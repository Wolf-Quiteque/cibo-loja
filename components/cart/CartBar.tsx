"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-store";
import { formatKz } from "@/lib/money";

interface Props {
  storeId?: string;
}

export function CartBar({ storeId }: Props) {
  const { state, subtotal, totalQty } = useCart();
  if (totalQty === 0) return null;
  if (storeId && state.storeId !== storeId) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 safe-bottom">
      <Link
        href="/carrinho"
        className="mx-auto flex max-w-md items-center justify-between rounded-full bg-brand px-5 py-3 text-black shadow-[0_18px_40px_-12px_rgba(0,230,168,0.6)]"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <ShoppingBag size={18} />
          Ver carrinho
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black/15 px-1.5 text-[11px] font-bold">
            {totalQty}
          </span>
        </span>
        <span className="text-sm font-bold">{formatKz(subtotal)}</span>
      </Link>
    </div>
  );
}
