"use client";

import * as React from "react";
import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";
import { Check, ImageUp, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  name: string;
  label?: string;
  defaultUrl?: string;
  outputSize?: number;
  className?: string;
}

export function LogoCropper({
  name,
  label,
  defaultUrl,
  outputSize = 512,
  className,
}: Props) {
  const pickerRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(defaultUrl ?? null);
  const [cleared, setCleared] = React.useState(false);

  const [editingSrc, setEditingSrc] = React.useState<string | null>(null);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [areaPx, setAreaPx] = React.useState<Area | null>(null);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditingSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = React.useCallback((_: Area, p: Area) => setAreaPx(p), []);

  const cancel = () => setEditingSrc(null);

  const apply = async () => {
    if (!editingSrc || !areaPx) return;
    const blob = await cropToBlob(editingSrc, areaPx, outputSize);
    if (!blob) return;
    const file = new File([blob], "logo.webp", { type: "image/webp" });
    const dt = new DataTransfer();
    dt.items.add(file);
    if (formRef.current) formRef.current.files = dt.files;
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(blob));
    setCleared(false);
    setEditingSrc(null);
  };

  const clear = () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCleared(true);
    if (formRef.current) formRef.current.value = "";
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <span className="text-xs font-medium text-text-muted pl-1">{label}</span>}

      <div
        onClick={() => pickerRef.current?.click()}
        className="relative aspect-square overflow-hidden rounded-2xl border border-dashed border-border-strong bg-surface cursor-pointer transition hover:border-brand/60"
      >
        {previewUrl ? (
          <>
            <Image src={previewUrl} alt="logo" fill sizes="200px" className="object-cover" unoptimized />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
              aria-label="Remover logótipo"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-text-muted">
            <ImageUp size={22} />
            <span className="text-xs text-center px-2">Toque para escolher e cortar</span>
          </div>
        )}
      </div>

      <input
        ref={pickerRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onSelect}
      />
      <input ref={formRef} type="file" name={cleared ? "" : name} className="hidden" />

      {editingSrc && (
        <CropperModal
          src={editingSrc}
          crop={crop}
          zoom={zoom}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          onCancel={cancel}
          onApply={apply}
        />
      )}
    </div>
  );
}

function CropperModal(props: {
  src: string;
  crop: { x: number; y: number };
  zoom: number;
  onCropChange: (c: { x: number; y: number }) => void;
  onZoomChange: (z: number) => void;
  onCropComplete: (a: Area, p: Area) => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur safe-top safe-bottom">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={props.onCancel}
          className="rounded-full p-2 text-white hover:bg-white/10"
          aria-label="Cancelar"
        >
          <X size={20} />
        </button>
        <h2 className="text-sm font-semibold text-white">Cortar logótipo</h2>
        <button
          type="button"
          onClick={props.onApply}
          className="flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-black"
        >
          <Check size={14} /> Aplicar
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <Cropper
          image={props.src}
          crop={props.crop}
          zoom={props.zoom}
          aspect={1}
          cropShape="rect"
          showGrid={false}
          objectFit="contain"
          onCropChange={props.onCropChange}
          onZoomChange={props.onZoomChange}
          onCropComplete={props.onCropComplete}
        />
      </div>

      <div className="flex items-center gap-3 px-5 py-4">
        <ZoomOut size={16} className="text-text-muted" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={props.zoom}
          onChange={(e) => props.onZoomChange(Number(e.target.value))}
          className="flex-1 accent-[var(--color-brand)]"
        />
        <ZoomIn size={16} className="text-text-muted" />
      </div>
    </div>
  );
}

async function cropToBlob(src: string, area: Area, size: number): Promise<Blob | null> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/webp", 0.85));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
