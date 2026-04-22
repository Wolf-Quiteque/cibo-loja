import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  title?: string;
  back?: string | boolean;
  right?: React.ReactNode;
  transparent?: boolean;
}

export function TopBar({ title, back, right, transparent }: Props) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 safe-top",
        transparent
          ? "bg-gradient-to-b from-black/50 to-transparent"
          : "glass border-b border-border",
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3">
        {back && (
          <Link
            href={typeof back === "string" ? back : "/"}
            aria-label="Voltar"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/5"
          >
            <ChevronLeft size={22} />
          </Link>
        )}
        {title && <h1 className="flex-1 truncate text-base font-semibold">{title}</h1>}
        {!title && <div className="flex-1" />}
        <div className="flex items-center gap-1">{right}</div>
      </div>
    </header>
  );
}
