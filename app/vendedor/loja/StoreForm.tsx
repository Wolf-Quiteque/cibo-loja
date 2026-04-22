"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { LogoCropper } from "@/components/ui/LogoCropper";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { saveStore, type StoreActionState } from "@/actions/stores";

interface Props {
  defaults?: {
    name: string;
    description: string;
    category: string;
    phone: string;
    address: string;
    deliveryFee: number;
    isOpen: boolean;
    logoUrl?: string;
    bannerUrl?: string;
  };
}

export function StoreForm({ defaults }: Props) {
  const [state, formAction] = useActionState<StoreActionState, FormData>(saveStore, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <ImagePicker name="banner" aspect="wide" label="Banner" defaultUrl={defaults?.bannerUrl} />
      <div className="max-w-[160px]">
        <LogoCropper name="logo" label="Logótipo" defaultUrl={defaults?.logoUrl} />
      </div>

      <Input label="Nome da loja" name="name" defaultValue={defaults?.name} required maxLength={60} />
      <Input
        label="Categoria"
        name="category"
        placeholder="Ex.: Comida angolana, Pizza, Grelhados"
        defaultValue={defaults?.category}
        required
        maxLength={40}
      />
      <Textarea
        label="Descrição"
        name="description"
        placeholder="Conte aos clientes o que vocês servem…"
        defaultValue={defaults?.description}
        maxLength={500}
      />
      <Input
        label="Telefone"
        name="phone"
        type="tel"
        inputMode="numeric"
        placeholder="9XXXXXXXX"
        defaultValue={defaults?.phone}
        required
      />
      <Input
        label="Endereço"
        name="address"
        placeholder="Rua, bairro, município"
        defaultValue={defaults?.address}
        required
      />
      <Input
        label="Taxa de entrega (Kz)"
        name="deliveryFee"
        type="number"
        inputMode="numeric"
        min={0}
        defaultValue={defaults?.deliveryFee ?? 0}
      />

      <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
        <input
          type="checkbox"
          name="isOpen"
          defaultChecked={defaults?.isOpen ?? true}
          className="h-4 w-4 accent-[var(--color-brand)]"
        />
        <span className="text-sm">Loja aberta e a aceitar pedidos</span>
      </label>

      {state?.error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </div>
      )}

      <SubmitButton size="lg" className="w-full">
        <Save size={16} /> Guardar loja
      </SubmitButton>
    </form>
  );
}
