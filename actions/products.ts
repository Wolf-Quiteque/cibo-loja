"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { products, stores, ObjectId } from "@/lib/db";
import { productSchema } from "@/lib/validation";
import { uploadImage } from "./uploads";
import { deleteObject, keyFromPublicUrl } from "@/lib/r2";

export type ProductState = { error?: string } | null;

async function ownStore(vendorId: ObjectId) {
  const col = await stores();
  const store = await col.findOne({ vendorId });
  if (!store) throw new Error("Crie primeiro a sua loja");
  return store;
}

export async function createProduct(
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  const session = await requireRole("vendedor");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    category: formData.get("category"),
    available: formData.get("available") === "on" || formData.get("available") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const vendorId = new ObjectId(session.sub);
  const store = await ownStore(vendorId);
  const _id = new ObjectId();

  let imageUrl: string | undefined;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const up = await uploadImage(image, "photo", `products/${_id.toHexString()}`);
    imageUrl = up.url;
  }

  const col = await products();
  await col.insertOne({
    _id,
    storeId: store._id,
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    imageUrl,
    category: parsed.data.category,
    available: parsed.data.available,
    createdAt: new Date(),
  });

  revalidatePath("/vendedor/produtos");
  revalidatePath(`/lojas/${store.slug}`);
  redirect("/vendedor/produtos");
}

export async function updateProduct(
  productId: string,
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  const session = await requireRole("vendedor");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    category: formData.get("category"),
    available: formData.get("available") === "on" || formData.get("available") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const vendorId = new ObjectId(session.sub);
  const store = await ownStore(vendorId);
  const col = await products();
  const product = await col.findOne({ _id: new ObjectId(productId), storeId: store._id });
  if (!product) return { error: "Produto não encontrado" };

  let imageUrl = product.imageUrl;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const up = await uploadImage(image, "photo", `products/${product._id.toHexString()}`);
    if (product.imageUrl) {
      const k = keyFromPublicUrl(product.imageUrl);
      if (k) deleteObject(k).catch(() => {});
    }
    imageUrl = up.url;
  }

  await col.updateOne(
    { _id: product._id },
    {
      $set: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        category: parsed.data.category,
        available: parsed.data.available,
        imageUrl,
      },
    },
  );

  revalidatePath("/vendedor/produtos");
  revalidatePath(`/lojas/${store.slug}`);
  redirect("/vendedor/produtos");
}

export async function deleteProduct(productId: string): Promise<void> {
  const session = await requireRole("vendedor");
  const vendorId = new ObjectId(session.sub);
  const store = await ownStore(vendorId);
  const col = await products();
  const product = await col.findOne({ _id: new ObjectId(productId), storeId: store._id });
  if (!product) return;
  await col.deleteOne({ _id: product._id });
  if (product.imageUrl) {
    const k = keyFromPublicUrl(product.imageUrl);
    if (k) deleteObject(k).catch(() => {});
  }
  revalidatePath("/vendedor/produtos");
  revalidatePath(`/lojas/${store.slug}`);
}
