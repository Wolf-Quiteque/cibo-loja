"use client";

import { useActionState } from "react";
import { UploadCloud } from "lucide-react";
import { ImagePicker } from "@/components/ui/ImagePicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { uploadPaymentProof, type OrderActionState } from "@/actions/orders";

export function PaymentProofUploader({ orderId }: { orderId: string }) {
  const action = uploadPaymentProof.bind(null, orderId);
  const [state, formAction] = useActionState<OrderActionState, FormData>(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Após efetuar a transferência, tire uma foto nítida do comprovativo e envie abaixo.
      </p>
      <ImagePicker name="proof" aspect="wide" />
      {state?.error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </div>
      )}
      <SubmitButton size="lg" className="w-full">
        <UploadCloud size={16} /> Enviar comprovativo
      </SubmitButton>
    </form>
  );
}
