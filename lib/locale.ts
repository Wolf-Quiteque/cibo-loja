import type { OrderStatus, PaymentMethod, PaymentStatus } from "./db";

export const orderStatusLabel: Record<OrderStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  preparando: "A preparar",
  a_caminho: "A caminho",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const orderStatusTone: Record<OrderStatus, string> = {
  pendente: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  confirmado: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  preparando: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  a_caminho: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  entregue: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelado: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  dinheiro_na_entrega: "Dinheiro na entrega",
  transferencia: "Transferência bancária",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  aguardando: "A aguardar pagamento",
  comprovante_enviado: "Comprovativo enviado",
  confirmado: "Pagamento confirmado",
};

export const orderStatusFlow: OrderStatus[] = [
  "pendente",
  "confirmado",
  "preparando",
  "a_caminho",
  "entregue",
];

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("pt-AO", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
