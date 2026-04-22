import Link from "next/link";
import Image from "next/image";
import { Store as StoreIcon } from "lucide-react";
import { Badge } from "@/components/ui/Card";
import { formatKz } from "@/lib/money";

interface Props {
  store: {
    slug: string;
    name: string;
    category: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    deliveryFee: number;
    isOpen: boolean;
  };
}

export function StoreCard({ store }: Props) {
  return (
    <Link
      href={`/lojas/${store.slug}`}
      className="group block overflow-hidden rounded-card border border-border bg-surface transition-all hover:border-brand/40 hover:translate-y-[-2px]"
    >
      <div className="relative aspect-[16/9] bg-gradient-to-br from-surface-2 to-bg-soft">
        {store.bannerUrl ? (
          <Image
            src={store.bannerUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-text-dim">
            <StoreIcon size={36} />
          </div>
        )}
        <div className="absolute top-2 left-2">
          {store.isOpen ? (
            <Badge tone="brand">Aberto</Badge>
          ) : (
            <Badge tone="danger">Fechado</Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 p-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-2">
          {store.logoUrl && (
            <Image src={store.logoUrl} alt="" fill sizes="48px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{store.name}</div>
          <div className="truncate text-xs text-text-muted">{store.category}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-text-muted">Entrega</div>
          <div className="text-xs font-semibold">
            {store.deliveryFee > 0 ? formatKz(store.deliveryFee) : "Grátis"}
          </div>
        </div>
      </div>
    </Link>
  );
}
