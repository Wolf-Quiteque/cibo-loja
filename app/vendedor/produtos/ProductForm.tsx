"use client";

import { useActionState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createProduct, updateProduct, deleteProduct, type ProductState } from "@/actions/products";

interface Defaults {
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
}

export function ProductForm({ productId, defaults }: { productId?: string; defaults?: Defaults }) {
  const action = productId ? updateProduct.bind(null, productId) : createProduct;
  const [state, formAction] = useActionState<ProductState, FormData>(action, null);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <ImagePicker name="image" label="Foto do produto" defaultUrl={defaults?.imageUrl} aspect="wide" />

        <Input label="Nome" name="name" required maxLength={80} defaultValue={defaults?.name} />
        <Input
          label="Categoria"
          name="category"
          placeholder="Ex.: Pratos, Bebidas, Sobremesas"
          required
          maxLength={40}
          defaultValue={defaults?.category}
        />
        <Textarea
          label="Descrição"
          name="description"
          placeholder="Ingredientes, acompanhamentos…"
          maxLength={500}
          defaultValue={defaults?.description}
        />
        <Input
          label="Preço (Kz)"
          name="price"
          type="number"
          inputMode="numeric"
          min={1}
          required
          defaultValue={defaults?.price}
        />

        <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <input
            type="checkbox"
            name="available"
            defaultChecked={defaults?.available ?? true}
            className="h-4 w-4 accent-[var(--color-brand)]"
          />
          <span className="text-sm">Disponível para encomenda</span>
        </label>

        {state?.error && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </div>
        )}

        <SubmitButton size="lg" className="w-full">
          <Save size={16} /> {productId ? "Guardar alterações" : "Adicionar produto"}
        </SubmitButton>
      </form>

      {productId && (
        <form action={deleteProduct.bind(null, productId)}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-danger/30 bg-danger/10 py-3 text-sm font-semibold text-danger"
          >
            <Trash2 size={16} /> Eliminar produto
          </button>
        </form>
      )}
    </div>
  );
}
