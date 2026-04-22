"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, UtensilsCrossed, Receipt } from "lucide-react";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/vendedor", label: "Resumo", icon: LayoutDashboard, exact: true },
  { href: "/vendedor/loja", label: "Loja", icon: Store },
  { href: "/vendedor/produtos", label: "Produtos", icon: UtensilsCrossed },
  { href: "/vendedor/pedidos", label: "Pedidos", icon: Receipt },
];

export function VendorNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto mb-2 max-w-md px-3">
        <div className="glass flex items-center justify-between rounded-full px-2 py-1.5 shadow-xl">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] transition-colors",
                  active ? "text-white" : "text-text-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    active ? "bg-accent/15 text-accent" : "",
                  )}
                >
                  <Icon size={20} />
                </span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
