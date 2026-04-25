"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { stores, ObjectId } from "@/lib/db";
import { storeSchema } from "@/lib/validation";
import { slugify } from "@/lib/slug";
import { uploadImage } from "./uploads";
import { deleteObject, keyFromPublicUrl } from "@/lib/r2";

export type StoreActionState = { error?: string; ok?: boolean } | null;

async function uniqueSlug(base: string, ignoreId?: ObjectId): Promise<string> {
  const col = await stores();
  let slug = base || "loja";
  let i = 1;

  while (true) {
    const found = await col.findOne({ slug });
    if (!found || (ignoreId && found._id.equals(ignoreId))) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

export async function saveStore(
  _prev: StoreActionState,
  formData: FormData,
): Promise<StoreActionState> {
  const session = await requireRole("vendedor");
  const parsed = storeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    category: formData.get("category"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    deliveryFee: formData.get("deliveryFee") ?? 0,
    isOpen: formData.get("isOpen") === "on" || formData.get("isOpen") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const vendorId = new ObjectId(session.sub);
  const col = await stores();
  const existing = await col.findOne({ vendorId });

  const logoFile = formData.get("logo");
  const bannerFile = formData.get("banner");

  let logoUrl = existing?.logoUrl;
  let bannerUrl = existing?.bannerUrl;

  if (logoFile instanceof File && logoFile.size > 0) {
    const up = await uploadImage(logoFile, "logo", `stores/${vendorId.toHexString()}/logo`);
    if (existing?.logoUrl) {
      const k = keyFromPublicUrl(existing.logoUrl);
      if (k) deleteObject(k).catch(() => {});
    }
    logoUrl = up.url;
  }
  if (bannerFile instanceof File && bannerFile.size > 0) {
    const up = await uploadImage(bannerFile, "banner", `stores/${vendorId.toHexString()}/banner`);
    if (existing?.bannerUrl) {
      const k = keyFromPublicUrl(existing.bannerUrl);
      if (k) deleteObject(k).catch(() => {});
    }
    bannerUrl = up.url;
  }

  if (existing) {
    await col.updateOne(
      { _id: existing._id },
      {
        $set: {
          name: parsed.data.name,
          description: parsed.data.description,
          category: parsed.data.category,
          phone: parsed.data.phone,
          address: parsed.data.address,
          deliveryFee: parsed.data.deliveryFee,
          isOpen: parsed.data.isOpen,
          logoUrl,
          bannerUrl,
        },
      },
    );
  } else {
    const slug = await uniqueSlug(slugify(parsed.data.name));
    await col.insertOne({
      _id: new ObjectId(),
      vendorId,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      category: parsed.data.category,
      phone: parsed.data.phone,
      address: parsed.data.address,
      deliveryFee: parsed.data.deliveryFee,
      isOpen: parsed.data.isOpen,
      logoUrl,
      bannerUrl,
      approved: false,
      suspended: false,
      createdAt: new Date(),
    });
  }

  revalidatePath("/vendedor");
  revalidatePath("/vendedor/loja");
  revalidatePath("/");
  redirect("/vendedor");
}

export async function toggleStoreOpen(): Promise<void> {
  const session = await requireRole("vendedor");
  const col = await stores();
  const store = await col.findOne({ vendorId: new ObjectId(session.sub) });
  if (!store) return;
  await col.updateOne({ _id: store._id }, { $set: { isOpen: !store.isOpen } });
  revalidatePath("/vendedor");
  revalidatePath("/");
  revalidatePath(`/lojas/${store.slug}`);
}
