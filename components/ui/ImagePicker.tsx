"use client";

import * as React from "react";
import Image from "next/image";
import { ImageUp, Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { compressImageFile } from "@/lib/client-image";

interface Props {
  name: string;
  label?: string;
  defaultUrl?: string;
  aspect?: "square" | "wide";
  className?: string;
  maxDimension?: number;
  quality?: number;
}

export function ImagePicker({
  name,
  label,
  defaultUrl,
  aspect = "square",
  className,
  maxDimension = 2000,
  quality = 0.82,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(defaultUrl ?? null);
  const [cleared, setCleared] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    setCleared(false);
    setProcessing(true);
    const rawUrl = URL.createObjectURL(raw);
    setPreview(rawUrl);
    try {
      const compressed = await compressImageFile(raw, { maxDimension, quality });
      if (compressed !== raw && inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(compressed);
        inputRef.current.files = dt.files;
        URL.revokeObjectURL(rawUrl);
        setPreview(URL.createObjectURL(compressed));
      }
    } finally {
      setProcessing(false);
    }
  };

  const clear = () => {
    setPreview(null);
    setCleared(true);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <span className="text-xs font-medium text-text-muted pl-1">{label}</span>}
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed border-border-strong bg-surface cursor-pointer transition hover:border-brand/60",
          aspect === "square" ? "aspect-square" : "aspect-[16/7]",
        )}
      >
        {preview ? (
          <>
            <Image src={preview} alt="preview" fill sizes="400px" className="object-cover" unoptimized />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Remover imagem"
            >
              <X size={14} />
            </button>
            {processing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                <Loader2 size={22} className="animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-text-muted">
            <ImageUp size={22} />
            <span className="text-xs">Toque para adicionar foto</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        name={cleared ? "" : name}
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}
