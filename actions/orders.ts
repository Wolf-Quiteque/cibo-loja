"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireSession } from "@/lib/auth";
import {
  orders,
  products,
  stores,
  ObjectId,
  type OrderItem,
  type OrderStatus,
} from "@/lib/db";
import { placeOrderSchema } from "@/lib/validation";
import { uploadImage } from "./uploads";

export type OrderActionState = { error?: string; orderId?: string } | null;

export async function placeOrder(
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const session = await requireRole("cliente");

  const itemsRaw = formData.get("items");
  let itemsParsed: unknown = [];
  try {
    itemsParsed = typeof itemsRaw === "string" ? JSON.parse(itemsRaw) : [];
  } catch {
    return { error: "Carrinho inválido" };
  }

  const parsed = placeOrderSchema.safeParse({
    storeId: formData.get("storeId"),
    items: itemsParsed,
    street: formData.get("street"),
    city: formData.get("city"),
    notes: formData.get("notes") ?? "",
    phone: formData.get("phone"),
    paymentMethod: formData.get("paymentMethod"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const storeOid = new ObjectId(parsed.data.storeId);
  const store = await (await stores()).findOne({ _id: storeOid });
  if (!store) return { error: "Loja não encontrada" };
  if (!store.isOpen) return { error: "Esta loja está fechada de momento" };

  const prodCol = await products();
  const productIds = parsed.data.items.map((i) => new ObjectId(i.productId));
  const foundProducts = await prodCol
    .find({ _id: { $in: productIds }, storeId: storeOid, available: true })
    .toArray();
  const map = new Map(foundProducts.map((p) => [p._id.toHexString(), p]));

  const items: OrderItem[] = [];
  for (const it of parsed.data.items) {
    const p = map.get(it.productId);
    if (!p) return { error: "Um dos produtos deixou de estar disponível" };
    items.push({ productId: p._id, name: p.name, price: p.price, qty: it.qty });
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = store.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;

  const _id = new ObjectId();
  const now = new Date();
  await (await orders()).insertOne({
    _id,
    clientId: new ObjectId(session.sub),
    storeId: storeOid,
    storeName: store.name,
    items,
    subtotal,
    deliveryFee,
    total,
    status: "pendente",
    deliveryAddress: {
      street: parsed.data.street,
      city: parsed.data.city,
      notes: parsed.data.notes || undefined,
      phone: parsed.data.phone,
    },
    paymentMethod: parsed.data.paymentMethod,
    paymentStatus: parsed.data.paymentMethod === "dinheiro_na_entrega" ? "aguardando" : "aguardando",
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/pedidos");
  revalidatePath("/vendedor/pedidos");
  redirect(`/pedidos/${_id.toHexString()}`);
}

export async function uploadPaymentProof(
  orderId: string,
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const session = await requireRole("cliente");
  const file = formData.get("proof");
  if (!(file instanceof File) || file.size === 0) return { error: "Envie uma imagem do comprovativo" };

  const oid = new ObjectId(orderId);
  const col = await orders();
  const order = await col.findOne({ _id: oid, clientId: new ObjectId(session.sub) });
  if (!order) return { error: "Pedido não encontrado" };

  const up = await uploadImage(file, "proof", `payments/${oid.toHexString()}`);
  await col.updateOne(
    { _id: oid },
    {
      $set: {
        paymentProofUrl: up.url,
        paymentStatus: "comprovante_enviado",
        updatedAt: new Date(),
      },
    },
  );

  revalidatePath(`/pedidos/${orderId}`);
  revalidatePath("/vendedor/pedidos");
  return { orderId };
}

const VALID_NEXT: Record<OrderStatus, OrderStatus[]> = {
  pendente: ["confirmado", "cancelado"],
  confirmado: ["preparando", "cancelado"],
  preparando: ["a_caminho", "cancelado"],
  a_caminho: ["entregue"],
  entregue: [],
  cancelado: [],
};

export async function updateOrderStatus(orderId: string, next: OrderStatus): Promise<void> {
  const session = await requireRole("vendedor");
  const vendorId = new ObjectId(session.sub);
  const store = await (await stores()).findOne({ vendorId });
  if (!store) return;

  const col = await orders();
  const order = await col.findOne({ _id: new ObjectId(orderId), storeId: store._id });
  if (!order) return;
  if (!VALID_NEXT[order.status].includes(next)) return;

  await col.updateOne({ _id: order._id }, { $set: { status: next, updatedAt: new Date() } });
  revalidatePath("/vendedor/pedidos");
  revalidatePath(`/pedidos/${orderId}`);
}

export async function confirmPayment(orderId: string): Promise<void> {
  const session = await requireRole("vendedor");
  const vendorId = new ObjectId(session.sub);
  const store = await (await stores()).findOne({ vendorId });
  if (!store) return;

  const col = await orders();
  await col.updateOne(
    { _id: new ObjectId(orderId), storeId: store._id },
    { $set: { paymentStatus: "confirmado", updatedAt: new Date() } },
  );
  revalidatePath("/vendedor/pedidos");
  revalidatePath(`/pedidos/${orderId}`);
}

export async function getMyOrders() {
  const session = await requireSession();
  const col = await orders();
  if (session.role === "cliente") {
    return col
      .find({ clientId: new ObjectId(session.sub) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
  }
  const store = await (await stores()).findOne({ vendorId: new ObjectId(session.sub) });
  if (!store) return [];
  return col.find({ storeId: store._id }).sort({ createdAt: -1 }).limit(100).toArray();
}
