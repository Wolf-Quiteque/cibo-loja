import { redirect } from "next/navigation";
import { TopBar } from "@/components/nav/TopBar";
import { getSession } from "@/lib/auth";
import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Finalizar pedido" };

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/entrar?next=/checkout");
  if (session.role !== "cliente") redirect("/");

  return (
    <>
      <TopBar title="Finalizar pedido" back="/carrinho" />
      <div className="mx-auto max-w-md px-5 pb-28 pt-4">
        <CheckoutForm />
      </div>
    </>
  );
}
