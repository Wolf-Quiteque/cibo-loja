import { TopBar } from "@/components/nav/TopBar";
import { requireRole } from "@/lib/auth";
import { stores, ObjectId } from "@/lib/db";
import { StoreForm } from "./StoreForm";

export const metadata = { title: "A minha loja" };

export default async function VendedorLojaPage() {
  const session = await requireRole("vendedor");
  const store = await (await stores()).findOne({ vendorId: new ObjectId(session.sub) });

  return (
    <>
      <TopBar title={store ? "Editar loja" : "Criar loja"} back="/vendedor" />
      <div className="mx-auto max-w-md px-5 pt-4">
        <StoreForm
          defaults={
            store
              ? {
                  name: store.name,
                  description: store.description,
                  category: store.category,
                  phone: store.phone,
                  address: store.address,
                  deliveryFee: store.deliveryFee,
                  isOpen: store.isOpen,
                  logoUrl: store.logoUrl,
                  bannerUrl: store.bannerUrl,
                }
              : undefined
          }
        />
      </div>
    </>
  );
}
