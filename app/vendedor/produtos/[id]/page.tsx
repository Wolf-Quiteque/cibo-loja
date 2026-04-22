import { notFound } from "next/navigation";
import { TopBar } from "@/components/nav/TopBar";
import { requireRole } from "@/lib/auth";
import { products, stores, ObjectId } from "@/lib/db";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "Editar produto" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarProdutoPage({ params }: Props) {
  const { id } = await params;
  const session = await requireRole("vendedor");
  const store = await (await stores()).findOne({ vendorId: new ObjectId(session.sub) });
  if (!store) notFound();

  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    notFound();
  }

  const product = await (await products()).findOne({ _id: oid, storeId: store._id });
  if (!product) notFound();

  return (
    <>
      <TopBar title="Editar produto" back="/vendedor/produtos" />
      <div className="mx-auto max-w-md px-5 pt-4">
        <ProductForm
          productId={product._id.toHexString()}
          defaults={{
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            available: product.available,
            imageUrl: product.imageUrl,
          }}
        />
      </div>
    </>
  );
}
