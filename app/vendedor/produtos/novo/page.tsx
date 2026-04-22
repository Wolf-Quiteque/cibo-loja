import { redirect } from "next/navigation";
import { TopBar } from "@/components/nav/TopBar";
import { requireRole } from "@/lib/auth";
import { stores, ObjectId } from "@/lib/db";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "Novo produto" };

export default async function NovoProdutoPage() {
  const session = await requireRole("vendedor");
  const store = await (await stores()).findOne({ vendorId: new ObjectId(session.sub) });
  if (!store) redirect("/vendedor/loja");

  return (
    <>
      <TopBar title="Novo produto" back="/vendedor/produtos" />
      <div className="mx-auto max-w-md px-5 pt-4">
        <ProductForm />
      </div>
    </>
  );
}
