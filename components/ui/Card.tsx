import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface",
        className,
      )}
      {...rest}
    />
  );
}

export function Badge({
  className,
  tone = "neutral",
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "brand" | "accent" | "danger" | "warning" }) {
  const tones = {
    neutral: "bg-white/5 text-text-muted border border-border",
    brand: "bg-brand/15 text-brand border border-brand/30",
    accent: "bg-accent/15 text-accent border border-accent/30",
    danger: "bg-danger/15 text-danger border border-danger/30",
    warning: "bg-warning/15 text-warning border border-warning/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
