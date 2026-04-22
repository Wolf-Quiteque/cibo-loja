"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Receipt, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface Item {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  match: (p: string) => boolean;
}

const items: Item[] = [
  { href: "/", label: "Início", icon: Home, match: (p) => p === "/" },
  { href: "/buscar", label: "Buscar", icon: Search, match: (p) => p.startsWith("/buscar") },
  { href: "/carrinho", label: "Carrinho", icon: ShoppingBag, match: (p) => p.startsWith("/carrinho") },
  { href: "/pedidos", label: "Pedidos", icon: Receipt, match: (p) => p.startsWith("/pedidos") },
  { href: "/conta", label: "Conta", icon: User, match: (p) => p.startsWith("/conta") || p.startsWith("/entrar") || p.startsWith("/criar-conta") },
];

export function BottomNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("cibo:cart");
        if (!raw) return setCount(0);
        const cart = JSON.parse(raw) as { items?: { qty: number }[] };
        setCount((cart.items ?? []).reduce((s, i) => s + (i.qty || 0), 0));
      } catch {
        setCount(0);
      }
    };
    read();
    const onUpdate = () => read();
    window.addEventListener("cibo:cart-change", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("cibo:cart-change", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto mb-2 max-w-md px-3">
        <div className="glass flex items-center justify-between rounded-full px-2 py-1.5 shadow-xl">
          {items.map((it) => {
            const Icon = it.icon;
            const active = it.match(pathname);
            const showBadge = it.href === "/carrinho" && count > 0;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] transition-colors",
                  active ? "text-white" : "text-text-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-all",
                    active
                      ? "bg-brand/15 text-brand glow-brand"
                      : "",
                  )}
                >
                  <Icon size={20} />
                  {showBadge && (
                    <span className="absolute top-1 right-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-black">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                {it.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
